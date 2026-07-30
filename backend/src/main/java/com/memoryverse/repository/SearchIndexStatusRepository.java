package com.memoryverse.repository;

import com.memoryverse.entity.SearchIndexStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface SearchIndexStatusRepository extends JpaRepository<SearchIndexStatus, Long> {
    Optional<SearchIndexStatus> findByDocumentId(Long documentId);
    List<SearchIndexStatus> findByUserId(Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM SearchIndexStatus sis WHERE sis.document.id = :documentId")
    void deleteByDocumentId(@Param("documentId") Long documentId);

    @Modifying
    @Transactional
    @Query("DELETE FROM SearchIndexStatus sis WHERE sis.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
