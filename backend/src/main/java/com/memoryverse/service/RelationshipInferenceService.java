package com.memoryverse.service;

import com.memoryverse.entity.GraphEdge;
import com.memoryverse.entity.GraphNode;
import com.memoryverse.entity.User;
import com.memoryverse.exception.ApiException;
import com.memoryverse.exception.ResourceNotFoundException;
import com.memoryverse.repository.GraphEdgeRepository;
import com.memoryverse.repository.GraphNodeRepository;
import com.memoryverse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class RelationshipInferenceService {

    @Autowired
    private GraphNodeRepository nodeRepository;

    @Autowired
    private GraphEdgeRepository edgeRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public GraphEdge createManualRelationship(Long userId, Long sourceNodeId, Long targetNodeId, String relationshipType, String evidence) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        GraphNode sourceNode = nodeRepository.findById(sourceNodeId)
                .orElseThrow(() -> new ResourceNotFoundException("GraphNode", "id", sourceNodeId));

        GraphNode targetNode = nodeRepository.findById(targetNodeId)
                .orElseThrow(() -> new ResourceNotFoundException("GraphNode", "id", targetNodeId));

        // Security check: Verify user owns both nodes
        if (!sourceNode.getUser().getId().equals(userId) || !targetNode.getUser().getId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Unauthorized access to graph nodes");
        }

        // Check if edge already exists
        Optional<GraphEdge> existing = edgeRepository.findByUserIdAndSourceNodeIdAndTargetNodeIdAndRelationshipType(
                userId, sourceNodeId, targetNodeId, relationshipType
        );

        if (existing.isPresent()) {
            GraphEdge edge = existing.get();
            edge.setStatus("CONFIRMED"); // Auto-confirm if user creates it manually
            edge.setEvidence(evidence);
            edge.setRelationshipSource("USER_CREATED");
            return edgeRepository.save(edge);
        }

        GraphEdge newEdge = GraphEdge.builder()
                .user(user)
                .sourceNode(sourceNode)
                .targetNode(targetNode)
                .relationshipType(relationshipType)
                .confidenceScore(1.0f) // Manual creation has 100% confidence
                .evidence(evidence)
                .generationMethod("MANUAL")
                .relationshipSource("USER_CREATED")
                .status("CONFIRMED")
                .build();

        return edgeRepository.save(newEdge);
    }
}
