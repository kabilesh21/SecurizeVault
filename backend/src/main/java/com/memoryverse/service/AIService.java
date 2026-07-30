package com.memoryverse.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
public class AIService {

    private static final Logger logger = LoggerFactory.getLogger(AIService.class);

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String performOcr(String originalFilename, byte[] fileBytes) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            ByteArrayResource fileResource = new ByteArrayResource(fileBytes) {
                @Override
                public String getFilename() {
                    return originalFilename;
                }
            };
            body.add("file", fileResource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    aiServiceUrl + "/ocr",
                    requestEntity,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return (String) response.getBody().get("text");
            }
        } catch (Exception e) {
            logger.warn("FastAPI OCR request failed, returning fallback mock text. Error: {}", e.getMessage());
        }
        return "OCR Placeholder. Failed to connect to Python AI Service.";
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> extractMetadata(String filename, String ocrText) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("file_name", filename);
            body.add("text_content", ocrText);

            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    aiServiceUrl + "/extract-metadata",
                    requestEntity,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            logger.warn("FastAPI extract-metadata request failed, returning fallback mock metadata. Error: {}", e.getMessage());
        }

        // Mock Fallback
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("title", filename.split("\\.")[0]);
        fallback.put("skills", Collections.emptyList());
        fallback.put("organization", "Unknown");
        fallback.put("year", "2026");
        fallback.put("category", "Unknown");
        return fallback;
    }

    public void triggerEmbeddings(String ocrText) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> body = new HashMap<>();
            body.put("text", ocrText);

            HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(
                    aiServiceUrl + "/embeddings",
                    requestEntity,
                    Map.class
            );
        } catch (Exception e) {
            logger.warn("FastAPI embeddings request failed. Error: {}", e.getMessage());
        }
    }
}
