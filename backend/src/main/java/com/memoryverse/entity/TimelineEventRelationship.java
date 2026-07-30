package com.memoryverse.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "timeline_event_relationships")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimelineEventRelationship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timeline_event_id", nullable = false)
    private TimelineEvent timelineEvent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "relationship_id", nullable = false)
    private GraphEdge relationship;
}
