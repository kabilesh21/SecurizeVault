package com.memoryverse.repository;

import com.memoryverse.entity.CategorizationResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CategorizationResultRepository extends JpaRepository<CategorizationResult, Long> {
    Optional<CategorizationResult> findByDocumentId(Long documentId);
    Optional<CategorizationResult> findByDocumentIdAndDocumentUserId(Long documentId, Long userId);
}
