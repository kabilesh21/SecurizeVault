package com.memoryverse.repository;

import com.memoryverse.entity.DocumentSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DocumentSkillRepository extends JpaRepository<DocumentSkill, Long> {
    List<DocumentSkill> findByDocumentId(Long documentId);
    
    @Query("SELECT ds FROM DocumentSkill ds WHERE ds.document.user.id = :userId")
    List<DocumentSkill> findByUserId(@Param("userId") Long userId);
    
    void deleteByDocumentId(Long documentId);
}
