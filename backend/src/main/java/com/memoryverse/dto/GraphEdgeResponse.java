package com.memoryverse.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GraphEdgeResponse {
    private Long id;
    private Long sourceNodeId;
    private String sourceNodeName;
    private String sourceNodeType;
    private Long targetNodeId;
    private String targetNodeName;
    private String targetNodeType;
    private String relationshipType;
    private Float confidenceScore;
    private String evidence;
    private String generationMethod;
    private String relationshipSource;
    private String status;
    private LocalDateTime createdAt;
}
