package com.memoryverse.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimelineMilestoneResponse {
    private Long id;
    private Long timelineEventId;
    private String milestoneType;
    private String label;
    private Integer importanceScore;
}
