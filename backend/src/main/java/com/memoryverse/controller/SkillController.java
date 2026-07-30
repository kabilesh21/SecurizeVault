package com.memoryverse.controller;

import com.memoryverse.dto.DocumentResponse;
import com.memoryverse.security.UserPrincipal;
import com.memoryverse.service.SkillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    @Autowired
    private SkillService skillService;

    @GetMapping
    public ResponseEntity<List<String>> getExtractedSkills(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<String> skills = skillService.getExtractedSkills(userPrincipal.getId());
        return ResponseEntity.ok(skills);
    }

    @GetMapping("/{skillName}/documents")
    public ResponseEntity<List<DocumentResponse>> getDocumentsBySkill(
            @PathVariable String skillName,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<DocumentResponse> documents = skillService.getDocumentsBySkill(userPrincipal.getId(), skillName);
        return ResponseEntity.ok(documents);
    }
}
