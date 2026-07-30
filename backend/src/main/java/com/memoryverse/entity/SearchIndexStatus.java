package com.memoryverse.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "search_index_status")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchIndexStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false, unique = true)
    private Document document;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "index_status", nullable = false, length = 50)
    @Builder.Default
    private String indexStatus = "PENDING"; // PENDING, INDEXED, FAILED

    @Column(name = "indexed_at")
    private LocalDateTime indexedAt;

    @Column(name = "embedding_version", length = 50)
    @Builder.Default
    private String embeddingVersion = "all-MiniLM-L6-v2";

    @Column(name = "last_error", columnDefinition = "TEXT")
    private String lastError;

    @PrePersist
    protected void onCreate() {
        if (indexStatus == null) {
            indexStatus = "PENDING";
        }
        if (embeddingVersion == null) {
            embeddingVersion = "all-MiniLM-L6-v2";
        }
    }
}
