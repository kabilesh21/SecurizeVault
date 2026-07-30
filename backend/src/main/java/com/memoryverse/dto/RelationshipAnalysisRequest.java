package com.memoryverse.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RelationshipAnalysisRequest {
    private Long userId;
    private List<DocumentInput> documents;
    private List<SkillInput> skills;
    private List<EntityInput> entities;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentInput {
        private Long id;
        private String title;
        private String originalName;
        private String category;
        private String ocrText;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillInput {
        private String name;
        private Float confidence;
        private Long documentId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EntityInput {
        private String type;
        private String value;
        private Float confidence;
        private Long documentId;
    }
}
