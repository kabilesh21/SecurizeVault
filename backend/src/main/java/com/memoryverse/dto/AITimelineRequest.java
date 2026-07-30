package com.memoryverse.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AITimelineRequest {
    private Long userId;
    private List<AITimelineDocumentInput> documents;
    private List<AITimelineSkillInput> skills;
    private List<AITimelineEntityInput> entities;
    private List<AITimelineRelationshipInput> relationships;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AITimelineDocumentInput {
        private Long id;
        private String title;
        private String originalName;
        private String category;
        private String ocrText;
        private String uploadedAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AITimelineSkillInput {
        private Long id;
        private String name;
        private float confidence;
        private Long documentId;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AITimelineEntityInput {
        private Long id;
        private String type;
        private String value;
        private float confidence;
        private Long documentId;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AITimelineRelationshipInput {
        private Long id;
        private Long sourceNodeId;
        private Long targetNodeId;
        private String relationshipType;
        private float confidenceScore;
        private String status;
    }
}
