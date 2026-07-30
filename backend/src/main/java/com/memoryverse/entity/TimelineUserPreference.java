package com.memoryverse.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "timeline_user_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimelineUserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "timeline_layout", length = 50)
    @Builder.Default
    private String timelineLayout = "VERTICAL";

    @Column(name = "show_low_importance")
    @Builder.Default
    private Boolean showLowImportance = true;

    @Column(name = "minimum_importance")
    @Builder.Default
    private Integer minimumImportance = 0;

    @Column(name = "grouping_mode", length = 50)
    @Builder.Default
    private String groupingMode = "YEAR";
}
