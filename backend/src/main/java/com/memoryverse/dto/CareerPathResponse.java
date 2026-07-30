package com.memoryverse.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareerPathResponse {
    private Long id;
    private String name;
    private String description;
    private String industry;
    private String requiredSkills;
    private Float confidenceScore;
    private String reason;
    private String status;
}
