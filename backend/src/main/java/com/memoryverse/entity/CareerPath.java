package com.memoryverse.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "career_paths")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CareerPath {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String name; // e.g. AI/ML Engineer

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 255)
    private String industry;

    @Column(name = "required_skills", columnDefinition = "TEXT")
    private String requiredSkills; // Comma-separated list

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
