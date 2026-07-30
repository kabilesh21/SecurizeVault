package com.memoryverse.repository;

import com.memoryverse.entity.GraphEdge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface GraphEdgeRepository extends JpaRepository<GraphEdge, Long> {
    List<GraphEdge> findByUserId(Long userId);
    List<GraphEdge> findByUserIdAndStatus(Long userId, String status);
    List<GraphEdge> findByUserIdAndStatusNot(Long userId, String status);
    Optional<GraphEdge> findByUserIdAndSourceNodeIdAndTargetNodeIdAndRelationshipType(Long userId, Long sourceNodeId, Long targetNodeId, String relationshipType);
    List<GraphEdge> findBySourceNodeIdOrTargetNodeId(Long sourceNodeId, Long targetNodeId);
    List<GraphEdge> findByUserIdAndSourceNodeIdOrUserIdAndTargetNodeId(Long userId1, Long sourceNodeId, Long userId2, Long targetNodeId);
    void deleteByUserId(Long userId);
}
