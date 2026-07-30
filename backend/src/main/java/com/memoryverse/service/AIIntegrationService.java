package com.memoryverse.service;

import com.memoryverse.dto.CategorizationRequest;
import com.memoryverse.dto.DocumentAnalysisResponse;
import com.memoryverse.dto.ExtractedEntityResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Collections;
import java.util.Map;

@Service
public class AIIntegrationService {

    private static final Logger logger = LoggerFactory.getLogger(AIIntegrationService.class);

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @SuppressWarnings("unchecked")
    public Map<String, Object> categorizeDocument(Long documentId, String text, String fileName) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            CategorizationRequest requestPayload = CategorizationRequest.builder()
                    .documentId(documentId)
                    .text(text)
                    .fileName(fileName)
                    .build();

            HttpEntity<CategorizationRequest> requestEntity = new HttpEntity<>(requestPayload, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    aiServiceUrl + "/categorize",
                    requestEntity,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            logger.error("FastAPI /categorize request failed. Error: {}", e.getMessage());
        }
        return null;
    }
}
