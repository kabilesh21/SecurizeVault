package com.memoryverse.controller;

import com.memoryverse.dto.DocumentResponse;
import com.memoryverse.entity.Category;
import com.memoryverse.security.UserPrincipal;
import com.memoryverse.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{categoryName}/documents")
    public ResponseEntity<List<DocumentResponse>> getDocumentsByCategory(
            @PathVariable String categoryName,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<DocumentResponse> documents = categoryService.getUserDocumentsByCategory(userPrincipal.getId(), categoryName);
        return ResponseEntity.ok(documents);
    }
}
