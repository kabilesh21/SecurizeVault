package com.memoryverse.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "categorization_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategorizationResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false, unique = true)
    private Document document;

    @Column(name = "primary_category", nullable = false, length = 50)
    private String primaryCategory; // Original AI predicted primary category name

    @Column(name = "overall_confidence", nullable = false)
    private Float overallConfidence;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "corrected_category_id")
    private Category correctedCategory; // Nullable user corrected category

    @Column(name = "processing_status", nullable = false, length = 50)
    private String processingStatus; // PENDING, PROCESSING, COMPLETED, FAILED

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "processing_error", columnDefinition = "TEXT")
    private String processingError;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        processedAt = LocalDateTime.now();
    }
}
