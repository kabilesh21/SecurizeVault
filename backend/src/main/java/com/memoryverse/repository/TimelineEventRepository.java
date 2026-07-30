package com.memoryverse.repository;

import com.memoryverse.entity.TimelineEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface TimelineEventRepository extends JpaRepository<TimelineEvent, Long> {

    List<TimelineEvent> findByUserIdOrderByStartDateAsc(Long userId);

    List<TimelineEvent> findByUserIdAndEventTypeOrderByStartDateAsc(Long userId, String eventType);

    List<TimelineEvent> findByUserIdAndEventStatusOrderByStartDateAsc(Long userId, String status);

    @Query("SELECT te FROM TimelineEvent te WHERE te.user.id = :userId AND te.eventStatus = 'ACTIVE' ORDER BY te.startDate ASC NULLS LAST")
    List<TimelineEvent> findActiveEventsByUserId(@Param("userId") Long userId);

    @Query("SELECT te FROM TimelineEvent te WHERE te.user.id = :userId AND te.importanceScore >= :minScore AND te.eventStatus = 'ACTIVE' ORDER BY te.startDate ASC NULLS LAST")
    List<TimelineEvent> findByUserIdAndMinImportance(@Param("userId") Long userId, @Param("minScore") Integer minScore);

    @Modifying
    @Transactional
    @Query("DELETE FROM TimelineEvent te WHERE te.user.id = :userId AND te.isUserCreated = false")
    void deleteAiGeneratedByUserId(@Param("userId") Long userId);

    long countByUserIdAndEventStatus(Long userId, String status);
}
