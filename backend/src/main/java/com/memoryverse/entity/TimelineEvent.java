package com.memoryverse.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "timeline_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimelineEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "display_date", length = 100)
    private String displayDate;

    @Column(name = "date_precision", length = 50)
    private String datePrecision;

    @Column(name = "date_source", length = 50)
    private String dateSource;

    @Column(name = "importance_score")
    private Integer importanceScore;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Column(name = "organization", length = 255)
    private String organization;

    @Column(name = "technologies_json", columnDefinition = "TEXT")
    private String technologiesJson;

    @Column(name = "keywords_json", columnDefinition = "TEXT")
    private String keywordsJson;

    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;

    @Column(name = "event_status", nullable = false, length = 50)
    @Builder.Default
    private String eventStatus = "ACTIVE";

    @Column(name = "is_user_created")
    @Builder.Default
    private Boolean isUserCreated = false;

    @Column(name = "is_user_confirmed")
    @Builder.Default
    private Boolean isUserConfirmed = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (eventStatus == null) eventStatus = "ACTIVE";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
