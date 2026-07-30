package com.memoryverse.repository;

import com.memoryverse.entity.TimelineMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface TimelineMilestoneRepository extends JpaRepository<TimelineMilestone, Long> {
    List<TimelineMilestone> findByUserIdOrderByImportanceScoreDesc(Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM TimelineMilestone tm WHERE tm.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
