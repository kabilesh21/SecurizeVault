package com.memoryverse.controller;

import com.memoryverse.dto.*;
import com.memoryverse.security.UserPrincipal;
import com.memoryverse.service.SearchHistoryService;
import com.memoryverse.service.SearchIndexService;
import com.memoryverse.service.SmartRetrievalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    @Autowired
    private SmartRetrievalService smartRetrievalService;

    @Autowired
    private SearchHistoryService searchHistoryService;

    @Autowired
    private SearchIndexService searchIndexService;

    @PostMapping
    public ResponseEntity<SearchResponse> search(
            @RequestBody SearchRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        SearchResponse response = smartRetrievalService.performSearch(request.getQuery(), userPrincipal.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<SearchHistoryResponse>> getSearchHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<SearchHistoryResponse> history = searchHistoryService.getHistory(userPrincipal.getId());
        return ResponseEntity.ok(history);
    }

    @DeleteMapping("/history/{historyId}")
    public ResponseEntity<Void> deleteHistoryItem(
            @PathVariable Long historyId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        searchHistoryService.deleteHistoryEntry(userPrincipal.getId(), historyId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/history")
    public ResponseEntity<Void> clearHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        searchHistoryService.clearHistory(userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reindex")
    public ResponseEntity<Map<String, String>> reindexAll(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        searchIndexService.reindexAllUserDocuments(userPrincipal.getId());
        return ResponseEntity.ok(Collections.singletonMap("message", "Triggered reindexing of all documents."));
    }

    @PostMapping("/reindex/document/{documentId}")
    public ResponseEntity<Map<String, String>> reindexDocument(
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        searchIndexService.indexDocument(documentId, userPrincipal.getId());
        return ResponseEntity.ok(Collections.singletonMap("message", "Document reindexed successfully."));
    }

    @GetMapping("/status")
    public ResponseEntity<SearchStatusResponse> getStatus(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        SearchStatusResponse status = searchIndexService.getStatus(userPrincipal.getId());
        return ResponseEntity.ok(status);
    }
}
