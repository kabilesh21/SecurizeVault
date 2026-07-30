package com.memoryverse.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentAnalysisResponse {
    private Long documentId;
    private String primaryCategory; // Predicted AI category
    private Float primaryConfidence; // Predicted AI confidence
    private String correctedCategory; // Corrected category by user (if any)
    private String activeCategory; // Corrected Category (if present) else Primary Category
    private List<CategoryResult> secondaryCategories;
    private List<SkillResult> skills;
    private ExtractedEntityResult entities;
    private String processingStatus;
    private String processingError;
    private LocalDateTime processedAt;
}
