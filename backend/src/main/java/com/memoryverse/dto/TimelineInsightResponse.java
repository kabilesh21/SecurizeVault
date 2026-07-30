package com.memoryverse.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimelineInsightResponse {
    private Long id;
    private String insightType;
    private String title;
    private String description;
    private Double confidenceScore;
}
