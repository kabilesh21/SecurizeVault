package com.memoryverse.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimelineEventResponse {
    private Long id;
    private String title;
    private String description;
    private String eventType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String displayDate;
    private String datePrecision;
    private String dateSource;
    private Integer importanceScore;
    private Double confidenceScore;
    private String organization;
    private List<String> technologies;
    private List<String> keywords;
    private String aiSummary;
    private String eventStatus;
    private Boolean isUserCreated;
    private Boolean isUserConfirmed;
    private List<Long> relatedDocumentIds;
    private List<String> relatedSkillNames;
    private List<String> milestoneLabels;
}
