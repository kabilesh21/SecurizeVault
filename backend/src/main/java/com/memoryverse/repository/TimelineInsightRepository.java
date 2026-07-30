package com.memoryverse.repository;

import com.memoryverse.entity.TimelineInsight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface TimelineInsightRepository extends JpaRepository<TimelineInsight, Long> {
    List<TimelineInsight> findByUserIdOrderByGeneratedAtDesc(Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM TimelineInsight ti WHERE ti.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
