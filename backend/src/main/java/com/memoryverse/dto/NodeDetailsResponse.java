package com.memoryverse.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NodeDetailsResponse {
    private Long id;
    private String name;
    private String type;
    private String description;
    private String metadataJson;
    private int relationsCount;
    private List<DocumentResponse> relatedDocuments;
    private List<GraphEdgeResponse> connectedRelationships;
    private List<String> skills;
    private List<String> technologies;
    private String source;
}
