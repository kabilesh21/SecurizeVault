package com.memoryverse.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManualRelationshipRequest {
    private Long sourceNodeId;
    private Long targetNodeId;
    private String relationshipType;
    private String evidence;
}
