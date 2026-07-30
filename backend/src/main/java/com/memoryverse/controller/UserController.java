package com.memoryverse.controller;

import com.memoryverse.dto.DashboardStatsResponse;
import com.memoryverse.dto.UserProfileResponse;
import com.memoryverse.security.UserPrincipal;
import com.memoryverse.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private DocumentService documentService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        DashboardStatsResponse stats = documentService.getStats(userPrincipal.getId());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getUserProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserProfileResponse profile = documentService.getProfile(userPrincipal.getId());
        return ResponseEntity.ok(profile);
    }
}
