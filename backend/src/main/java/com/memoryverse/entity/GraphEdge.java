package com.memoryverse.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "graph_edges", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "source_node_id", "target_node_id", "relationship_type"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GraphEdge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_node_id", nullable = false)
    private GraphNode sourceNode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_node_id", nullable = false)
    private GraphNode targetNode;

    @Column(name = "relationship_type", nullable = false, length = 50)
    private String relationshipType; // CERTIFIES, USES, DEMONSTRATES, etc.

    @Column(name = "confidence_score", nullable = false)
    private Float confidenceScore;

    @Column(columnDefinition = "TEXT")
    private String evidence;

    @Column(name = "generation_method", nullable = false, length = 100)
    private String generationMethod; // AI_INFERRED, RULE_BASED, etc.

    @Column(name = "relationship_source", nullable = false, length = 50)
    private String relationshipSource; // AI_INFERRED, USER_CORRECTED, etc.

    @Column(nullable = false, length = 50)
    private String status; // ACTIVE, REJECTED, CONFIRMED

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
