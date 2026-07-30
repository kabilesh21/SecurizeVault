package com.memoryverse.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RelationshipResponse {
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
    private List<RelationshipEvidenceResponse> evidences;
    private LocalDateTime createdAt;
}
