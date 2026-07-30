package com.memoryverse.repository;

import com.memoryverse.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByUserIdOrderByUploadedAtDesc(Long userId);
    Optional<Document> findByIdAndUserId(Long id, Long userId);
    long countByUserId(Long userId);
    long countByUserIdAndCategoryName(Long userId, String categoryName);
    List<Document> findByUserIdAndCategoryNameOrderByUploadedAtDesc(Long userId, String categoryName);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM categorization_results WHERE document_id = :docId", nativeQuery = true)
    void deleteCategorizationResultsByDocId(@Param("docId") Long docId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM document_categories WHERE document_id = :docId", nativeQuery = true)
    void deleteDocumentCategoriesByDocId(@Param("docId") Long docId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM document_skills WHERE document_id = :docId", nativeQuery = true)
    void deleteDocumentSkillsByDocId(@Param("docId") Long docId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM extracted_entities WHERE document_id = :docId", nativeQuery = true)
    void deleteExtractedEntitiesByDocId(@Param("docId") Long docId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM search_index_status WHERE document_id = :docId", nativeQuery = true)
    void deleteSearchIndexStatusByDocId(@Param("docId") Long docId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM relationship_evidence WHERE document_id = :docId", nativeQuery = true)
    void deleteRelationshipEvidenceByDocId(@Param("docId") Long docId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM timeline_event_documents WHERE document_id = :docId", nativeQuery = true)
    void deleteTimelineEventDocumentsByDocId(@Param("docId") Long docId);

    @Modifying
    @Transactional
    @Query(value = "UPDATE graph_nodes SET source_document_id = NULL WHERE source_document_id = :docId", nativeQuery = true)
    void clearGraphNodeDocRef(@Param("docId") Long docId);
}
