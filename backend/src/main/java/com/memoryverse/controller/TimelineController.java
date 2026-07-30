package com.memoryverse.controller;

import com.memoryverse.dto.*;
import com.memoryverse.entity.TimelineUserPreference;
import com.memoryverse.security.UserPrincipal;
import com.memoryverse.service.TimelineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/timeline")
public class TimelineController {

    @Autowired
    private TimelineService timelineService;

    // ============================================
    // GENERATION ENDPOINTS
    // ============================================

    @PostMapping("/generate")
    public ResponseEntity<Map<String, String>> generateTimeline(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String status = timelineService.generateTimeline(userPrincipal.getId());
        return ResponseEntity.ok(Map.of("status", status));
    }

    @PostMapping("/rebuild")
    public ResponseEntity<Map<String, String>> rebuildTimeline(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String status = timelineService.rebuildTimeline(userPrincipal.getId());
        return ResponseEntity.ok(Map.of("status", status));
    }

    // ============================================
    // QUERY ENDPOINTS
    // ============================================

    @GetMapping
    public ResponseEntity<List<TimelineEventResponse>> getTimeline(
            @RequestParam(required = false) String eventType,
            @RequestParam(required = false) Integer minImportance,
            @RequestParam(required = false) String sortBy,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(timelineService.getEvents(userPrincipal.getId(), eventType, minImportance, sortBy));
    }

    @GetMapping("/events")
    public ResponseEntity<List<TimelineEventResponse>> getEvents(
            @RequestParam(required = false) String eventType,
            @RequestParam(required = false) Integer minImportance,
            @RequestParam(required = false) String sortBy,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(timelineService.getEvents(userPrincipal.getId(), eventType, minImportance, sortBy));
    }

    @GetMapping("/events/{eventId}")
    public ResponseEntity<TimelineEventResponse> getEventById(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(timelineService.getEventById(userPrincipal.getId(), eventId));
    }

    // ============================================
    // MANUAL EVENT CRUD
    // ============================================

    @PostMapping("/events/manual")
    public ResponseEntity<TimelineEventResponse> createManualEvent(
            @RequestBody TimelineEventRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(timelineService.createManualEvent(userPrincipal.getId(), request));
    }

    @PutMapping("/events/{eventId}")
    public ResponseEntity<TimelineEventResponse> updateEvent(
            @PathVariable Long eventId,
            @RequestBody TimelineEventRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(timelineService.updateEvent(userPrincipal.getId(), eventId, request));
    }

    @DeleteMapping("/events/{eventId}")
    public ResponseEntity<Void> deleteEvent(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        timelineService.deleteEvent(userPrincipal.getId(), eventId);
        return ResponseEntity.noContent().build();
    }

    // ============================================
    // CONFIRM / HIDE / RESTORE
    // ============================================

    @PostMapping("/events/{eventId}/confirm")
    public ResponseEntity<Void> confirmEvent(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        timelineService.confirmEvent(userPrincipal.getId(), eventId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/events/{eventId}/hide")
    public ResponseEntity<Void> hideEvent(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        timelineService.hideEvent(userPrincipal.getId(), eventId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/events/{eventId}/restore")
    public ResponseEntity<Void> restoreEvent(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        timelineService.restoreEvent(userPrincipal.getId(), eventId);
        return ResponseEntity.ok().build();
    }

    // ============================================
    // INSIGHTS & MILESTONES
    // ============================================

    @GetMapping("/insights")
    public ResponseEntity<List<TimelineInsightResponse>> getInsights(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(timelineService.getInsights(userPrincipal.getId()));
    }

    @GetMapping("/milestones")
    public ResponseEntity<List<TimelineMilestoneResponse>> getMilestones(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(timelineService.getMilestones(userPrincipal.getId()));
    }

    // ============================================
    // SUMMARY & STATISTICS
    // ============================================

    @GetMapping("/summary")
    public ResponseEntity<TimelineSummaryResponse> getSummary(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(timelineService.getSummary(userPrincipal.getId()));
    }

    @GetMapping("/statistics")
    public ResponseEntity<TimelineSummaryResponse> getStatistics(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(timelineService.getSummary(userPrincipal.getId()));
    }

    // ============================================
    // PREFERENCES
    // ============================================

    @GetMapping("/preferences")
    public ResponseEntity<TimelineUserPreference> getPreferences(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(timelineService.getOrCreatePreference(userPrincipal.getId()));
    }

    @PutMapping("/preferences")
    public ResponseEntity<TimelineUserPreference> updatePreferences(
            @RequestBody TimelinePreferenceRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(timelineService.updatePreference(userPrincipal.getId(), request));
    }
}
