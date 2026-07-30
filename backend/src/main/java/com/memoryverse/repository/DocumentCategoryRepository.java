package com.memoryverse.repository;

import com.memoryverse.entity.DocumentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentCategoryRepository extends JpaRepository<DocumentCategory, Long> {
    List<DocumentCategory> findByDocumentId(Long documentId);
    Optional<DocumentCategory> findByDocumentIdAndCategoryIdAndSource(Long documentId, Long categoryId, String source);
    List<DocumentCategory> findByDocumentIdAndIsPrimaryTrue(Long documentId);
    void deleteByDocumentIdAndSource(Long documentId, String source);
}
