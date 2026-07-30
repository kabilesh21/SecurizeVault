package com.memoryverse.repository;

import com.memoryverse.entity.UserCareerPath;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserCareerPathRepository extends JpaRepository<UserCareerPath, Long> {
    List<UserCareerPath> findByUserId(Long userId);
    Optional<UserCareerPath> findByUserIdAndCareerPathId(Long userId, Long careerPathId);
    void deleteByUserId(Long userId);
}
