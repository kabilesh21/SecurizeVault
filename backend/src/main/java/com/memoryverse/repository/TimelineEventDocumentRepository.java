package com.memoryverse.repository;

import com.memoryverse.entity.TimelineEventDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface TimelineEventDocumentRepository extends JpaRepository<TimelineEventDocument, Long> {
    List<TimelineEventDocument> findByTimelineEventId(Long timelineEventId);

    @Modifying
    @Transactional
    @Query("DELETE FROM TimelineEventDocument ted WHERE ted.timelineEvent.id = :eventId")
    void deleteByTimelineEventId(@Param("eventId") Long eventId);
}
