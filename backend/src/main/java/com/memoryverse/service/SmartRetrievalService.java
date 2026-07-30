package com.memoryverse.service;

import com.memoryverse.dto.SearchResponse;
import com.memoryverse.dto.SearchResultResponse;
import com.memoryverse.entity.Document;
import com.memoryverse.entity.DocumentSkill;
import com.memoryverse.entity.TimelineEvent;
import com.memoryverse.entity.GraphNode;
import com.memoryverse.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SmartRetrievalService {

    private static final Logger logger = LoggerFactory.getLogger(SmartRetrievalService.class);

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private DocumentSkillRepository documentSkillRepository;

    @Autowired
    private TimelineEventRepository timelineEventRepository;

    @Autowired
    private GraphNodeRepository graphNodeRepository;

    @Autowired
    private SearchHistoryService searchHistoryService;

    private final RestTemplate restTemplate = new RestTemplate();

    public SearchResponse performSearch(String query, Long userId) {
        if (query == null || query.strip().isEmpty()) {
            return SearchResponse.builder()
                    .query("")
                    .detectedIntent("GENERAL_SEARCH")
                    .intentConfidence(1.0)
                    .filters(Collections.emptyMap())
                    .results(Collections.emptyList())
                    .suggestions(Collections.emptyList())
                    .processingStatus("EMPTY")
                    .build();
        }

        try {
            // 1. Build request payload
            Map<String, Object> body = new HashMap<>();
            body.put("query", query);
            body.put("userId", userId);
            body.put("limit", 15);
            body.put("filters", Collections.emptyMap());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // 2. Call FastAPI
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    aiServiceUrl + "/search/",
                    requestEntity,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> resBody = response.getBody();
                
                // Parse intent
                Map<String, Object> intentMap = (Map<String, Object>) resBody.get("intent");
                String intent = (String) intentMap.get("name");
                Double confidence = (Double) intentMap.get("confidence");
                Map<String, Object> filters = (Map<String, Object>) resBody.get("filters");
                List<String> suggestions = (List<String>) resBody.get("suggestions");

                // Parse vector results
                List<Map<String, Object>> aiResults = (List<Map<String, Object>>) resBody.get("results");
                List<SearchResultResponse> enrichedResults = new ArrayList<>();

                // Match with DB and verify ownership
                for (Map<String, Object> item : aiResults) {
                    Long docId = ((Number) item.get("documentId")).longValue();
                    Optional<Document> docOpt = documentRepository.findByIdAndUserId(docId, userId);
                    
                    if (docOpt.isPresent()) {
                        Document doc = docOpt.get();
                        Double relevance = (Double) item.get("relevanceScore");
                        String explanation = (String) item.get("explanation");
                        List<String> matchedSkills = (List<String>) item.get("matchedSkills");
                        
                        // Find related timeline events
                        Long timelineEventId = timelineEventRepository.findByUserIdOrderByStartDateAsc(userId).stream()
                                .filter(te -> te.getTitle().equalsIgnoreCase(doc.getTitle()) || te.getDescription().contains(doc.getTitle()))
                                .map(TimelineEvent::getId)
                                .findFirst()
                                .orElse(null);

                        // Find related graph node references
                        Long nodeId = graphNodeRepository.findByUserId(userId).stream()
                                .filter(node -> doc.getTitle().equalsIgnoreCase(node.getName()) || docId.equals(node.getEntityReferenceId()))
                                .map(GraphNode::getId)
                                .findFirst()
                                .orElse(null);

                        enrichedResults.add(SearchResultResponse.builder()
                                .documentId(doc.getId())
                                .title(doc.getTitle())
                                .resultType(doc.getCategory() != null ? doc.getCategory().getName() : "OTHER")
                                .description(explanation) // why matched
                                .matchedSkills(matchedSkills)
                                .relevanceScore(relevance)
                                .explanation(explanation)
                                .organization((String) item.get("organization"))
                                .displayDate((String) item.get("displayDate"))
                                .originalFileAvailable(true)
                                .fileType(doc.getFileType())
                                .originalFilename(doc.getOriginalName())
                                .timelineEventId(timelineEventId)
                                .nodeId(nodeId)
                                .confidenceScore((Double) item.get("confidenceScore"))
                                .build());
                    }
                }

                // Log in search history
                searchHistoryService.addHistoryEntry(userId, query, intent, enrichedResults.size());

                return SearchResponse.builder()
                        .query(query)
                        .detectedIntent(intent)
                        .intentConfidence(confidence)
                        .filters(filters)
                        .results(enrichedResults)
                        .suggestions(suggestions)
                        .processingStatus("COMPLETED")
                        .build();
            }

        } catch (Exception e) {
            logger.warn("FastAPI smart search failed, running database fallback search. Error: {}", e.getMessage());
        }

        // 3. Database keyword search fallback
        return runDatabaseFallback(query, userId);
    }

    private SearchResponse runDatabaseFallback(String query, Long userId) {
        String cleanQuery = query.toLowerCase().trim();
        List<Document> userDocs = documentRepository.findByUserIdOrderByUploadedAtDesc(userId);
        List<SearchResultResponse> results = new ArrayList<>();

        for (Document doc : userDocs) {
            double score = 0.0;
            List<String> matchedSkills = new ArrayList<>();

            String title = doc.getTitle().toLowerCase();
            String ocr = doc.getOcrText() != null ? doc.getOcrText().toLowerCase() : "";

            // Check title overlap
            if (title.contains(cleanQuery)) {
                score += 0.5;
            } else {
                // Word boundaries check
                for (String word : cleanQuery.split("\\s+")) {
                    if (word.length() > 2 && title.contains(word)) {
                        score += 0.15;
                    }
                }
            }

            // Check OCR text overlap
            if (ocr.contains(cleanQuery)) {
                score += 0.25;
            }

            // Check skills matches
            List<DocumentSkill> skills = documentSkillRepository.findByDocumentId(doc.getId());
            for (DocumentSkill s : skills) {
                String sName = s.getSkillName().toLowerCase();
                if (cleanQuery.contains(sName) || sName.contains(cleanQuery)) {
                    score += 0.2;
                    matchedSkills.add(s.getSkillName());
                }
            }

            if (score > 0) {
                // Find timeline events
                Long teId = timelineEventRepository.findByUserIdOrderByStartDateAsc(userId).stream()
                        .filter(te -> te.getTitle().equalsIgnoreCase(doc.getTitle()))
                        .map(TimelineEvent::getId)
                        .findFirst()
                        .orElse(null);

                // Find graph nodes
                Long nodeId = graphNodeRepository.findByUserId(userId).stream()
                        .filter(node -> doc.getTitle().equalsIgnoreCase(node.getName()))
                        .map(GraphNode::getId)
                        .findFirst()
                        .orElse(null);

                results.add(SearchResultResponse.builder()
                        .documentId(doc.getId())
                        .title(doc.getTitle())
                        .resultType(doc.getCategory() != null ? doc.getCategory().getName() : "OTHER")
                        .description("Matched via local keyword search profile overlap.")
                        .matchedSkills(matchedSkills)
                        .relevanceScore(Math.min(1.0, score))
                        .explanation("Matched via keyword matches on title/skills (AI Search Offline).")
                        .originalFileAvailable(true)
                        .fileType(doc.getFileType())
                        .originalFilename(doc.getOriginalName())
                        .timelineEventId(teId)
                        .nodeId(nodeId)
                        .confidenceScore(0.5)
                        .build());
            }
        }

        // Sort descending by score
        results.sort(Comparator.comparing(SearchResultResponse::getRelevanceScore).reversed());

        // Suggestions fallback
        List<String> suggestions = Arrays.asList(
                "Show all my certificates",
                "Show my AI projects",
                "Show my latest resume"
        );

        // Log entry
        searchHistoryService.addHistoryEntry(userId, query, "GENERAL_SEARCH", results.size());

        return SearchResponse.builder()
                .query(query)
                .detectedIntent("GENERAL_SEARCH")
                .intentConfidence(0.5)
                .filters(Collections.emptyMap())
                .results(results)
                .suggestions(suggestions)
                .processingStatus("COMPLETED_FALLBACK")
                .build();
    }
}
