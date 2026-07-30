package com.memoryverse.dto;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimelineEventRequest {
    private String title;
    private String description;
    private String eventType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String displayDate;
    private String datePrecision;
    private String dateSource;
    private String organization;
    private Integer importanceScore;
}
