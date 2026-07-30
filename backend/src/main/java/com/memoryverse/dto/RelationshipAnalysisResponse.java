package com.memoryverse.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RelationshipAnalysisResponse {
    private List<NodeResponse> nodes;
    private List<RelationshipResponse> relationships;
    private List<CareerRecommendation> careerPaths;
    private String processingStatus;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NodeResponse {
        private String temporaryId;
        private String type;
        private Long referenceId;
        private String name;
        private String description;
        private Map<String, Object> metadata;
        private Long sourceDocumentId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RelationshipResponse {
        private String source;
        private String target;
        private String type;
        private Float confidence;
        private String evidence;
        private String generationMethod;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CareerRecommendation {
        private String name;
        private Float confidence;
        private String reason;
    }
}
