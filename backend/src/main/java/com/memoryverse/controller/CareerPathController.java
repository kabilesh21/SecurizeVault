package com.memoryverse.controller;

import com.memoryverse.dto.CareerPathResponse;
import com.memoryverse.entity.CareerPath;
import com.memoryverse.security.UserPrincipal;
import com.memoryverse.service.CareerPathService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/career-paths")
public class CareerPathController {

    @Autowired
    private CareerPathService careerPathService;

    @GetMapping
    public ResponseEntity<List<CareerPath>> getAllPaths() {
        List<CareerPath> paths = careerPathService.getAllCareerPaths();
        return ResponseEntity.ok(paths);
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<CareerPathResponse>> getRecommendations(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<CareerPathResponse> recommendations = careerPathService.getRecommendedCareerPaths(userPrincipal.getId());
        return ResponseEntity.ok(recommendations);
    }
}
