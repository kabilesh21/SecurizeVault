package com.memoryverse.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimelinePreferenceRequest {
    private String timelineLayout;
    private Boolean showLowImportance;
    private Integer minimumImportance;
    private String groupingMode;
}
