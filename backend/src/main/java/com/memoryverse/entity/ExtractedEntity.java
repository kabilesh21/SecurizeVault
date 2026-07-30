package com.memoryverse.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "extracted_entities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExtractedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType; // ORGANIZATION, DATE, TITLE, KEYWORD, TECHNOLOGY, etc.

    @Column(name = "entity_value", nullable = false, length = 255)
    private String entityValue;

    @Column(name = "confidence_score", nullable = false)
    private Float confidenceScore;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
