package com.memoryverse.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchResultResponse {
    private Long documentId;
    private String title;
    private String resultType;
    private String description;
    private List<String> matchedSkills;
    private Double relevanceScore;
    private String explanation;
    private String organization;
    private String displayDate;
    private Boolean originalFileAvailable;
    private String fileType;
    private String originalFilename;
    private Long timelineEventId;
    private Long nodeId;
    private Double confidenceScore;
}
