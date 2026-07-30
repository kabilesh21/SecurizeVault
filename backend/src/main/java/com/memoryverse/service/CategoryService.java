package com.memoryverse.service;

import com.memoryverse.dto.DocumentResponse;
import com.memoryverse.entity.Category;
import com.memoryverse.repository.CategoryRepository;
import com.memoryverse.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private DocumentRepository documentRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public List<DocumentResponse> getUserDocumentsByCategory(Long userId, String categoryName) {
        return documentRepository.findByUserIdAndCategoryNameOrderByUploadedAtDesc(userId, categoryName)
                .stream()
                .map(doc -> DocumentResponse.builder()
                        .id(doc.getId())
                        .title(doc.getTitle())
                        .originalName(doc.getOriginalName())
                        .fileType(doc.getFileType())
                        .size(doc.getSize())
                        .category(doc.getCategory() != null ? doc.getCategory().getName() : "UNCLASSIFIED")
                        .status(doc.getStatus())
                        .ocrText(doc.getOcrText())
                        .uploadedAt(doc.getUploadedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
