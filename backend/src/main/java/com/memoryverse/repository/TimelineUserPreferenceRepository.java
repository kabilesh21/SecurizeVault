package com.memoryverse.repository;

import com.memoryverse.entity.TimelineUserPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TimelineUserPreferenceRepository extends JpaRepository<TimelineUserPreference, Long> {
    Optional<TimelineUserPreference> findByUserId(Long userId);
}
