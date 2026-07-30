package com.memoryverse.repository;

import com.memoryverse.entity.ExtractedEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExtractedEntityRepository extends JpaRepository<ExtractedEntity, Long> {
    List<ExtractedEntity> findByDocumentId(Long documentId);
    void deleteByDocumentId(Long documentId);
}
