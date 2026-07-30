package com.memoryverse.service;

import com.memoryverse.dto.RelationshipAnalysisRequest;
import com.memoryverse.dto.RelationshipAnalysisResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class AIRelationshipIntegrationService {

    private static final Logger logger = LoggerFactory.getLogger(AIRelationshipIntegrationService.class);

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public RelationshipAnalysisResponse analyzeRelationships(RelationshipAnalysisRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<RelationshipAnalysisRequest> requestEntity = new HttpEntity<>(request, headers);
            ResponseEntity<RelationshipAnalysisResponse> response = restTemplate.postForEntity(
                    aiServiceUrl + "/relationships/analyze",
                    requestEntity,
                    RelationshipAnalysisResponse.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                logger.error("AI Service returned error status: {}", response.getStatusCode());
                return null;
            }
        } catch (Exception e) {
            logger.error("Failed to connect to Python AI relationship engine: {}", e.getMessage());
            return null;
        }
    }
}
