package com.memoryverse.service;

import com.memoryverse.dto.AITimelineRequest;
import com.memoryverse.dto.AITimelineResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class AITimelineIntegrationService {

    private static final Logger logger = LoggerFactory.getLogger(AITimelineIntegrationService.class);

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public AITimelineResponse generateTimeline(AITimelineRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<AITimelineRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<AITimelineResponse> response = restTemplate.postForEntity(
                    aiServiceUrl + "/timeline/generate",
                    entity,
                    AITimelineResponse.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                logger.warn("AI Timeline service returned non-success: {}", response.getStatusCode());
                return null;
            }
        } catch (Exception e) {
            logger.error("Failed to connect to Python AI timeline service: {}", e.getMessage());
            return null;
        }
    }
}
