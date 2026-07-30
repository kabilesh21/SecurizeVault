package com.memoryverse.repository;

import com.memoryverse.entity.RelationshipEvidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RelationshipEvidenceRepository extends JpaRepository<RelationshipEvidence, Long> {
    List<RelationshipEvidence> findByRelationshipId(Long relationshipId);
}
