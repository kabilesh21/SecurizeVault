package com.memoryverse.controller;

import com.memoryverse.dto.DocumentAnalysisResponse;
import com.memoryverse.dto.DocumentResponse;
import com.memoryverse.dto.LinkRequest;
import com.memoryverse.entity.Document;
import com.memoryverse.repository.DocumentRepository;
import com.memoryverse.security.UserPrincipal;
import com.memoryverse.service.CategorizationService;
import com.memoryverse.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categorization")
public class CategorizationController {

    @Autowired
    private CategorizationService categorizationService;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private DocumentService documentService;

    @PostMapping("/analyze/{documentId}")
    public ResponseEntity<DocumentAnalysisResponse> analyzeDocument(
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        DocumentAnalysisResponse response = categorizationService.analyzeDocumentSync(documentId, userPrincipal.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/analyze-all")
    public ResponseEntity<Map<String, String>> analyzeAllDocuments(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Document> documents = documentRepository.findByUserIdOrderByUploadedAtDesc(userPrincipal.getId());
        
        // Analyze each document asynchronously
        for (Document doc : documents) {
            categorizationService.analyzeDocumentAsync(doc.getId(), userPrincipal.getId());
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "Triggered background analysis for " + documents.size() + " documents.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reprocess/{documentId}")
    public ResponseEntity<DocumentAnalysisResponse> reprocessDocument(
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        DocumentAnalysisResponse response = categorizationService.analyzeDocumentSync(documentId, userPrincipal.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/results/{documentId}")
    public ResponseEntity<DocumentAnalysisResponse> getCategorizationResults(
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        DocumentAnalysisResponse response = categorizationService.getAnalysisResponse(documentId, userPrincipal.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/documents")
    public ResponseEntity<List<DocumentResponse>> getCategorizedDocuments(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        // Return standard documents (since category is populated in document entity)
        List<DocumentResponse> response = documentService.getDocuments(userPrincipal.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{documentId}/category")
    public ResponseEntity<Map<String, String>> correctPrimaryCategory(
            @PathVariable Long documentId,
            @RequestBody Map<String, Long> payload,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        Long categoryId = payload.get("categoryId");
        if (categoryId == null) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", "categoryId is required"));
        }

        categorizationService.correctPrimaryCategory(documentId, categoryId, userPrincipal.getId());
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Primary category corrected successfully!");
        return ResponseEntity.ok(response);
    }
}
