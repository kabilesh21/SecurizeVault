package com.memoryverse.controller;

import com.memoryverse.dto.DocumentResponse;
import com.memoryverse.dto.LinkRequest;
import com.memoryverse.security.UserPrincipal;
import com.memoryverse.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @PostMapping("/upload")
    public ResponseEntity<DocumentResponse> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        DocumentResponse response = documentService.uploadDocument(file, userPrincipal.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<DocumentResponse>> getAllDocuments(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<DocumentResponse> documents = documentService.getDocuments(userPrincipal.getId());
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponse> getDocumentById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        DocumentResponse document = documentService.getDocumentById(id, userPrincipal.getId());
        return ResponseEntity.ok(document);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocumentResponse> replaceDocument(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        DocumentResponse response = documentService.replaceDocument(id, file, userPrincipal.getId());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        documentService.deleteDocument(id, userPrincipal.getId());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Document deleted successfully!");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/view")
    public ResponseEntity<Resource> viewDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            Path path = documentService.getFilePath(id, userPrincipal.getId());
            Resource resource = new UrlResource(path.toUri());

            if (resource.exists() || resource.isReadable()) {
                String contentType = Files.probeContentType(path);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            Path path = documentService.getFilePath(id, userPrincipal.getId());
            Resource resource = new UrlResource(path.toUri());

            if (resource.exists() || resource.isReadable()) {
                // Fetch original filename from database
                DocumentResponse doc = documentService.getDocumentById(id, userPrincipal.getId());
                String filename = doc != null ? doc.getOriginalName() : resource.getFilename();

                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/portfolio")
    public ResponseEntity<Map<String, String>> submitPortfolioLink(
            @RequestBody LinkRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        documentService.savePortfolioLink(request.getUrl(), userPrincipal.getId());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Portfolio Link saved successfully!");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/github")
    public ResponseEntity<Map<String, String>> submitGithubLink(
            @RequestBody LinkRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        documentService.saveGithubLink(request.getUrl(), userPrincipal.getId());
        Map<String, String> response = new HashMap<>();
        response.put("message", "GitHub Repository Link saved successfully!");
        return ResponseEntity.ok(response);
    }
}
