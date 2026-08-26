package com.memoryverse.service;

import com.memoryverse.dto.*;
import com.memoryverse.entity.*;
import com.memoryverse.exception.ApiException;
import com.memoryverse.exception.ResourceNotFoundException;
import com.memoryverse.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CategorizationService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private DocumentCategoryRepository documentCategoryRepository;

    @Autowired
    private DocumentSkillRepository documentSkillRepository;

    @Autowired
    private ExtractedEntityRepository extractedEntityRepository;

    @Autowired
    private CategorizationResultRepository categorizationResultRepository;

    @Autowired
    private AIIntegrationService aiIntegrationService;

    @Autowired
    private RelationshipDiscoveryService relationshipDiscoveryService;

    @Autowired
    private SearchIndexService searchIndexService;

    @Autowired
    private AIService aiService;

    @Transactional
    public DocumentAnalysisResponse analyzeDocumentSync(Long documentId, Long userId) {
        Document document = documentRepository.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));

        // 1. Create or get initial CategorizationResult
        CategorizationResult result = categorizationResultRepository.findByDocumentId(documentId)
                .orElseGet(() -> CategorizationResult.builder().document(document).build());

        result.setProcessingStatus("PROCESSING");
        result.setPrimaryCategory("UNKNOWN");
        result.setOverallConfidence(0.0f);
        result.setProcessingError(null);
        result = categorizationResultRepository.save(result);

        document.setStatus("PROCESSING");
        documentRepository.save(document);

        // 2. Fetch OCR text (Module 1 Output)
        String ocrText = document.getOcrText();
        boolean isPlaceholder = ocrText == null || ocrText.trim().isEmpty() || ocrText.contains("OCR Placeholder");
        if (isPlaceholder) {
            try {
                java.nio.file.Path path = java.nio.file.Paths.get(document.getFilePath());
                byte[] fileBytes = java.nio.file.Files.readAllBytes(path);
                if (fileBytes != null && fileBytes.length > 0) {
                    String freshOcr = aiService.performOcr(document.getOriginalName(), fileBytes);
                    if (freshOcr != null && !freshOcr.trim().isEmpty() && !freshOcr.contains("OCR Placeholder")) {
                        ocrText = freshOcr;
                        document.setOcrText(ocrText);
                        documentRepository.save(document);
                    }
                }
            } catch (Exception ex) {
                System.err.println("Failed to perform fresh OCR during analysis: " + ex.getMessage());
            }
        }
        if (ocrText == null || ocrText.trim().isEmpty()) {
            ocrText = "OCR Placeholder text. " + document.getOriginalName();
            document.setOcrText(ocrText);
            documentRepository.save(document);
        }

        // 3. Clear previous outputs (if reprocessing)
        documentCategoryRepository.deleteByDocumentIdAndSource(documentId, "AI");
        documentSkillRepository.deleteByDocumentId(documentId);
        extractedEntityRepository.deleteByDocumentId(documentId);

        try {
            // 4. Contact Python AI service
            Map<String, Object> aiResponse = aiIntegrationService.categorizeDocument(
                    documentId, ocrText, document.getOriginalName()
            );

            if (aiResponse == null) {
                throw new Exception("AI service response was empty or connection failed");
            }

            // Parse values
            String primaryCategoryName = (String) aiResponse.get("primaryCategory");
            Double primaryConfidence = (Double) aiResponse.get("primaryConfidence");
            
            // Map category name to entity
            Category category = categoryRepository.findByName(primaryCategoryName)
                    .orElseGet(() -> categoryRepository.findByName("OTHER_ACADEMIC").orElse(null));

            // Update primary document category link
            document.setCategory(category);
            document.setStatus("COMPLETED");
            documentRepository.save(document);

            // Update status record
            result.setPrimaryCategory(primaryCategoryName);
            result.setOverallConfidence(primaryConfidence.floatValue());
            result.setProcessingStatus("COMPLETED");
            result = categorizationResultRepository.save(result);

            // 5. Store primary mapping in document_categories
            if (category != null) {
                DocumentCategory primaryDocCat = DocumentCategory.builder()
                        .document(document)
                        .category(category)
                        .confidenceScore(primaryConfidence.floatValue())
                        .isPrimary(true)
                        .source("AI")
                        .build();
                documentCategoryRepository.save(primaryDocCat);
            }

            // 6. Store secondary mappings
            List<Map<String, Object>> secondaryCats = (List<Map<String, Object>>) aiResponse.get("secondaryCategories");
            if (secondaryCats != null) {
                for (Map<String, Object> sc : secondaryCats) {
                    String scName = (String) sc.get("name");
                    Double scConf = (Double) sc.get("confidence");
                    Optional<Category> scCatOpt = categoryRepository.findByName(scName);
                    if (scCatOpt.isPresent()) {
                        DocumentCategory secDocCat = DocumentCategory.builder()
                                .document(document)
                                .category(scCatOpt.get())
                                .confidenceScore(scConf.floatValue())
                                .isPrimary(false)
                                .source("AI")
                                .build();
                        documentCategoryRepository.save(secDocCat);
                    }
                }
            }

            // 7. Store skills
            List<Map<String, Object>> skills = (List<Map<String, Object>>) aiResponse.get("skills");
            if (skills != null) {
                for (Map<String, Object> s : skills) {
                    String sName = (String) s.get("name");
                    Double sConf = (Double) s.get("confidence");
                    DocumentSkill docSkill = DocumentSkill.builder()
                            .document(document)
                            .skillName(sName)
                            .confidenceScore(sConf.floatValue())
                            .source("AI")
                            .build();
                    documentSkillRepository.save(docSkill);
                }
            }

            // 8. Store extracted entities
            Map<String, Object> entities = (Map<String, Object>) aiResponse.get("entities");
            if (entities != null) {
                saveEntityList(document, entities, "title", "TITLE");
                saveEntityList(document, entities, "organization", "ORGANIZATION");
                saveEntityList(document, entities, "technologies", "TECHNOLOGY");
                saveEntityList(document, entities, "dates", "DATE");
                saveEntityList(document, entities, "keywords", "KEYWORD");
            }

        } catch (Exception e) {
            // AI service failed, perform graceful fallback
            result.setProcessingStatus("FAILED");
            result.setProcessingError("AI categorization failed: " + e.getMessage());
            categorizationResultRepository.save(result);

            document.setStatus("FAILED");
            documentRepository.save(document);
        }

        // Trigger graph relationship update automatically
        try {
            relationshipDiscoveryService.rebuildUserGraph(userId);
        } catch (Exception e) {
            System.err.println("Failed to auto-rebuild user graph after categorization: " + e.getMessage());
        }

        // Index document in vector store for Smart Retrieval
        try {
            searchIndexService.indexDocument(documentId, userId);
        } catch (Exception e) {
            System.err.println("Failed to index document for search: " + e.getMessage());
        }

        return getAnalysisResponse(documentId, userId);
    }

    @Async
    public void analyzeDocumentAsync(Long documentId, Long userId) {
        try {
            analyzeDocumentSync(documentId, userId);
        } catch (Exception e) {
            System.err.println("Async document analysis failed for documentId " + documentId + ": " + e.getMessage());
        }
    }

    private void saveEntityList(Document doc, Map<String, Object> entities, String key, String entityType) {
        List<String> values = (List<String>) entities.get(key);
        if (values != null) {
            for (String val : values) {
                ExtractedEntity entity = ExtractedEntity.builder()
                        .document(doc)
                        .entityType(entityType)
                        .entityValue(val)
                        .confidenceScore(0.85f) // Default confidence for extracted entity
                        .build();
                extractedEntityRepository.save(entity);
            }
        }
    }

    @Transactional
    public void correctPrimaryCategory(Long documentId, Long categoryId, Long userId) {
        Document document = documentRepository.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));

        CategorizationResult result = categorizationResultRepository.findByDocumentId(documentId)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Document has not been analyzed yet"));

        // Clear existing USER_CORRECTED records
        documentCategoryRepository.deleteByDocumentIdAndSource(documentId, "USER_CORRECTED");

        // Save override primary category mapping
        DocumentCategory overrideCat = DocumentCategory.builder()
                .document(document)
                .category(category)
                .confidenceScore(1.0f) // user corrected is 100% confident
                .isPrimary(true)
                .source("USER_CORRECTED")
                .build();
        documentCategoryRepository.save(overrideCat);

        // Update Document link reference
        document.setCategory(category);
        documentRepository.save(document);

        // Update result override
        result.setCorrectedCategory(category);
        categorizationResultRepository.save(result);

        // Update search index
        try {
            searchIndexService.indexDocument(documentId, userId);
        } catch (Exception e) {
            System.err.println("Failed to reindex document after category correction: " + e.getMessage());
        }
    }

    public DocumentAnalysisResponse getAnalysisResponse(Long documentId, Long userId) {
        Document document = documentRepository.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));

        CategorizationResult result = categorizationResultRepository.findByDocumentId(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("CategorizationResult", "documentId", documentId));

        List<DocumentCategory> docCats = documentCategoryRepository.findByDocumentId(documentId);
        List<DocumentSkill> skills = documentSkillRepository.findByDocumentId(documentId);
        List<ExtractedEntity> entities = extractedEntityRepository.findByDocumentId(documentId);

        // Map categories
        List<CategoryResult> secondaryCats = docCats.stream()
                .filter(dc -> !dc.getIsPrimary() && dc.getSource().equals("AI"))
                .map(dc -> CategoryResult.builder()
                        .name(dc.getCategory().getName())
                        .confidence(dc.getConfidenceScore())
                        .build())
                .collect(Collectors.toList());

        // Map skills
        List<SkillResult> skillResults = skills.stream()
                .map(ds -> SkillResult.builder()
                        .name(ds.getSkillName())
                        .confidence(ds.getConfidenceScore())
                        .build())
                .collect(Collectors.toList());

        // Map entities
        List<String> titles = extractEntityValues(entities, "TITLE");
        List<String> orgs = extractEntityValues(entities, "ORGANIZATION");
        List<String> techs = extractEntityValues(entities, "TECHNOLOGY");
        List<String> dates = extractEntityValues(entities, "DATE");
        List<String> keywords = extractEntityValues(entities, "KEYWORD");

        ExtractedEntityResult entitiesResult = ExtractedEntityResult.builder()
                .title(titles)
                .organization(orgs)
                .technologies(techs)
                .dates(dates)
                .keywords(keywords)
                .build();

        String activeCategoryName = result.getCorrectedCategory() != null 
                ? result.getCorrectedCategory().getName() 
                : result.getPrimaryCategory();

        return DocumentAnalysisResponse.builder()
                .documentId(documentId)
                .primaryCategory(result.getPrimaryCategory())
                .primaryConfidence(result.getOverallConfidence())
                .correctedCategory(result.getCorrectedCategory() != null ? result.getCorrectedCategory().getName() : null)
                .activeCategory(activeCategoryName)
                .secondaryCategories(secondaryCats)
                .skills(skillResults)
                .entities(entitiesResult)
                .processingStatus(result.getProcessingStatus())
                .processingError(result.getProcessingError())
                .processedAt(result.getProcessedAt())
                .build();
    }

    private List<String> extractEntityValues(List<ExtractedEntity> entities, String type) {
        return entities.stream()
                .filter(e -> e.getEntityType().equalsIgnoreCase(type))
                .map(ExtractedEntity::getEntityValue)
                .collect(Collectors.toList());
    }
}
