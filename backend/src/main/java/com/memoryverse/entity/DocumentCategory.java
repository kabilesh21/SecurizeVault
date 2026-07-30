package com.memoryverse.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "document_categories", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"document_id", "category_id", "source"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "confidence_score", nullable = false)
    private Float confidenceScore;

    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary;

    @Column(nullable = false, length = 50)
    private String source; // e.g. AI, USER_CORRECTED

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (source == null) {
            source = "AI";
        }
        if (isPrimary == null) {
            isPrimary = false;
        }
    }
}
