package com.memoryverse.repository;

import com.memoryverse.entity.GraphNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface GraphNodeRepository extends JpaRepository<GraphNode, Long> {
    List<GraphNode> findByUserId(Long userId);
    Optional<GraphNode> findByUserIdAndEntityTypeAndEntityReferenceIdAndName(Long userId, String entityType, Long entityReferenceId, String name);
    Optional<GraphNode> findByUserIdAndEntityTypeAndName(Long userId, String entityType, String name);
    void deleteByUserId(Long userId);
}
