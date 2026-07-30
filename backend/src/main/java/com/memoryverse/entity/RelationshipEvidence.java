package com.memoryverse.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "relationship_evidence")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RelationshipEvidence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "relationship_id", nullable = false)
    private GraphEdge relationship;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id")
    private Document document;

    @Column(name = "evidence_text", nullable = false, columnDefinition = "TEXT")
    private String evidenceText;

    @Column(name = "evidence_type", nullable = false, length = 50)
    private String evidenceType; // e.g. OCR_MATCH, METADATA_MATCH, TIMELINE_OVERLAP

    @Column(name = "relevance_score", nullable = false)
    private Float relevanceScore;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
