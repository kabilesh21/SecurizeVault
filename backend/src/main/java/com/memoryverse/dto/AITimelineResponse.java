package com.memoryverse.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AITimelineResponse {
    private List<AITimelineEventResult> events;
    private List<AITimelineMilestoneResult> milestones;
    private List<AITimelineInsightResult> insights;
    private String processingStatus;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AITimelineEventResult {
        private String temporaryId;
        private String title;
        private String description;
        private String eventType;
        private String startDate;
        private String endDate;
        private String displayDate;
        private String datePrecision;
        private String dateSource;
        private Integer importanceScore;
        private Double confidenceScore;
        private List<Long> relatedDocuments;
        private List<String> relatedSkills;
        private String organization;
        private List<String> technologies;
        private List<String> keywords;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AITimelineMilestoneResult {
        private String eventTemporaryId;
        private String milestoneType;
        private String label;
        private Integer importanceScore;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AITimelineInsightResult {
        private String type;
        private String title;
        private String description;
        private Double confidence;
    }
}
