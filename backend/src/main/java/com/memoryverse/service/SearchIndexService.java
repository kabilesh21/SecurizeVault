package com.memoryverse.service;

import com.memoryverse.dto.SearchStatusResponse;
import com.memoryverse.entity.*;
import com.memoryverse.exception.ResourceNotFoundException;
import com.memoryverse.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SearchIndexService {

    private static final Logger logger = LoggerFactory.getLogger(SearchIndexService.class);

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SearchIndexStatusRepository indexStatusRepository;

    @Autowired
    private DocumentSkillRepository documentSkillRepository;

    @Autowired
    private ExtractedEntityRepository extractedEntityRepository;

    @Autowired
    private CategorizationResultRepository categorizationResultRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    @Async
    @Transactional
    public void indexDocumentAsync(Long documentId, Long userId) {
        indexDocument(documentId, userId);
    }

    @Transactional
    public void indexDocument(Long documentId, Long userId) {
        Document doc = documentRepository.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Create or get status entry
        SearchIndexStatus status = indexStatusRepository.findByDocumentId(documentId)
                .orElseGet(() -> SearchIndexStatus.builder().document(doc).user(user).build());

        status.setIndexStatus("INDEXING");
        status.setLastError(null);
        status = indexStatusRepository.save(status);

        try {
            // 1. Compile Skills
            List<String> skills = documentSkillRepository.findByDocumentId(documentId).stream()
                    .map(DocumentSkill::getSkillName)
                    .collect(Collectors.toList());

            // 2. Compile Entities
            List<ExtractedEntity> entities = extractedEntityRepository.findByDocumentId(documentId);
            List<String> technologies = entities.stream()
                    .filter(e -> "TECHNOLOGY".equals(e.getEntityType()))
                    .map(ExtractedEntity::getEntityValue)
                    .collect(Collectors.toList());

            String organization = entities.stream()
                    .filter(e -> "ORGANIZATION".equals(e.getEntityType()))
                    .findFirst()
                    .map(ExtractedEntity::getEntityValue)
                    .orElse(null);

            String displayDate = entities.stream()
                    .filter(e -> "DATE".equals(e.getEntityType()) || "YEAR".equals(e.getEntityType()))
                    .findFirst()
                    .map(ExtractedEntity::getEntityValue)
                    .orElse(null);

            // 3. Compile Description / Summary
            String description = categorizationResultRepository.findByDocumentId(documentId)
                    .map(CategorizationResult::getPrimaryCategory)
                    .map(cat -> "Classified as " + cat + " document. Title: " + doc.getTitle())
                    .orElse("Document title: " + doc.getTitle());

            // 4. Construct API payload
            Map<String, Object> payload = new HashMap<>();
            payload.put("documentId", documentId);
            payload.put("userId", userId);
            payload.put("documentName", doc.getOriginalName());
            payload.put("category", doc.getCategory() != null ? doc.getCategory().getName() : "OTHER");
            payload.put("skills", skills);
            payload.put("textContent", doc.getOcrText() != null ? doc.getOcrText() : "");

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("title", doc.getTitle());
            metadata.put("organization", organization);
            metadata.put("technologies", technologies);
            metadata.put("displayDate", displayDate);
            metadata.put("uploadDate", doc.getUploadedAt().toString());
            metadata.put("description", description);
            metadata.put("confidenceScore", 1.0);
            payload.put("metadata", metadata);

            // 5. Send POST request to FastAPI
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    aiServiceUrl + "/search/index",
                    requestEntity,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                status.setIndexStatus("INDEXED");
                status.setIndexedAt(LocalDateTime.now());
                indexStatusRepository.save(status);
                logger.info("Successfully indexed document {} in vector database.", documentId);
            } else {
                throw new Exception("FastAPI indexing responded with status: " + response.getStatusCode());
            }

        } catch (Exception e) {
            logger.error("Failed to index document ID {}: {}", documentId, e.getMessage());
            status.setIndexStatus("FAILED");
            status.setLastError(e.getMessage());
            indexStatusRepository.save(status);
        }
    }

    @Transactional
    public void deleteDocumentFromIndex(Long documentId, Long userId) {
        try {
            restTemplate.delete(aiServiceUrl + "/search/index/" + userId + "/" + documentId);
            indexStatusRepository.deleteByDocumentId(documentId);
            logger.info("Deleted document {} from index.", documentId);
        } catch (Exception e) {
            logger.warn("Failed to delete document {} from FastAPI index: {}", documentId, e.getMessage());
        }
    }

    @Transactional
    public void reindexAllUserDocuments(Long userId) {
        List<Document> documents = documentRepository.findByUserIdOrderByUploadedAtDesc(userId);
        for (Document doc : documents) {
            indexDocument(doc.getId(), userId);
        }
    }

    public SearchStatusResponse getStatus(Long userId) {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                    aiServiceUrl + "/search/status?userId=" + userId,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                return SearchStatusResponse.builder()
                        .status((String) body.get("status"))
                        .documentsIndexed((Integer) body.get("documentsIndexed"))
                        .mode((String) body.get("mode"))
                        .build();
            }
        } catch (Exception e) {
            logger.warn("FastAPI status call failed: {}", e.getMessage());
        }

        // Return offline status
        return SearchStatusResponse.builder()
                .status("OFFLINE")
                .documentsIndexed(indexStatusRepository.findByUserId(userId).size())
                .mode("OFFLINE")
                .build();
    }
}
