package com.memoryverse.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KnowledgeGraphResponse {
    private List<GraphNodeResponse> nodes;
    private List<GraphEdgeResponse> edges;
}
