package com.memoryverse.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GraphFilterRequest {
    private String nodeType;
    private String relationshipType;
    private Float minConfidence;
    private String search;
    private String status;
}
