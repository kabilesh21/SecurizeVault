package com.memoryverse.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RelationshipEvidenceResponse {
    private Long id;
    private Long relationshipId;
    private Long documentId;
    private String documentTitle;
    private String evidenceText;
    private String evidenceType;
    private Float relevanceScore;
}
