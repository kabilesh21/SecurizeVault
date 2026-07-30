package com.memoryverse.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GraphNodeResponse {
    private Long id;
    private String entityType;
    private Long entityReferenceId;
    private String name;
    private String normalizedName;
    private String description;
    private String metadataJson;
    private Long sourceDocumentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
