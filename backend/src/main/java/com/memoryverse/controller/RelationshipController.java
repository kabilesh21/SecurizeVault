package com.memoryverse.controller;

import com.memoryverse.dto.*;
import com.memoryverse.entity.GraphEdge;
import com.memoryverse.repository.GraphEdgeRepository;
import com.memoryverse.security.UserPrincipal;
import com.memoryverse.service.RelationshipDiscoveryService;
import com.memoryverse.service.RelationshipEvidenceService;
import com.memoryverse.service.RelationshipInferenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class RelationshipController {

    @Autowired
    private RelationshipDiscoveryService discoveryService;

    @Autowired
    private RelationshipInferenceService inferenceService;

    @Autowired
    private RelationshipEvidenceService evidenceService;

    @Autowired
    private GraphEdgeRepository edgeRepository;

    @PostMapping("/relationships/analyze")
    public ResponseEntity<KnowledgeGraphResponse> analyzeRelationships(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        KnowledgeGraphResponse response = discoveryService.rebuildUserGraph(userPrincipal.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/relationships/analyze/document/{documentId}")
    public ResponseEntity<KnowledgeGraphResponse> analyzeDocumentRelationships(
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        // For hackathon scale, we rebuild the complete user graph to capture new links
        KnowledgeGraphResponse response = discoveryService.rebuildUserGraph(userPrincipal.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/relationships/rebuild")
    public ResponseEntity<KnowledgeGraphResponse> rebuildGraph(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        KnowledgeGraphResponse response = discoveryService.rebuildUserGraph(userPrincipal.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/relationships")
    public ResponseEntity<List<GraphEdgeResponse>> getRelationships(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        KnowledgeGraphResponse graph = discoveryService.getFullUserGraph(userPrincipal.getId());
        return ResponseEntity.ok(graph.getEdges());
    }

    @GetMapping("/relationships/{relationshipId}")
    public ResponseEntity<RelationshipResponse> getRelationshipWithEvidence(
            @PathVariable Long relationshipId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        GraphEdge edge = edgeRepository.findById(relationshipId)
                .orElseThrow(() -> new com.memoryverse.exception.ResourceNotFoundException("Relationship", "id", relationshipId));
        
        if (!edge.getUser().getId().equals(userPrincipal.getId())) {
            return ResponseEntity.status(451).build(); // Security block
        }

        List<RelationshipEvidenceResponse> evidences = evidenceService.getEvidencesForEdge(relationshipId);
        
        RelationshipResponse response = RelationshipResponse.builder()
                .id(edge.getId())
                .sourceNodeId(edge.getSourceNode().getId())
                .sourceNodeName(edge.getSourceNode().getName())
                .sourceNodeType(edge.getSourceNode().getEntityType())
                .targetNodeId(edge.getTargetNode().getId())
                .targetNodeName(edge.getTargetNode().getName())
                .targetNodeType(edge.getTargetNode().getEntityType())
                .relationshipType(edge.getRelationshipType())
                .confidenceScore(edge.getConfidenceScore())
                .evidence(edge.getEvidence())
                .generationMethod(edge.getGenerationMethod())
                .relationshipSource(edge.getRelationshipSource())
                .status(edge.getStatus())
                .evidences(evidences)
                .createdAt(edge.getCreatedAt())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/relationships/entity/{entityType}/{entityId}")
    public ResponseEntity<List<GraphEdgeResponse>> getEntityRelationships(
            @PathVariable String entityType,
            @PathVariable Long entityId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        List<GraphEdge> edges = edgeRepository.findByUserIdAndSourceNodeIdOrUserIdAndTargetNodeId(
                userPrincipal.getId(), entityId, userPrincipal.getId(), entityId
        );
        
        List<GraphEdgeResponse> responses = edges.stream()
                .filter(e -> !"REJECTED".equals(e.getStatus()))
                .map(edge -> GraphEdgeResponse.builder()
                        .id(edge.getId())
                        .sourceNodeId(edge.getSourceNode().getId())
                        .sourceNodeName(edge.getSourceNode().getName())
                        .sourceNodeType(edge.getSourceNode().getEntityType())
                        .targetNodeId(edge.getTargetNode().getId())
                        .targetNodeName(edge.getTargetNode().getName())
                        .targetNodeType(edge.getTargetNode().getEntityType())
                        .relationshipType(edge.getRelationshipType())
                        .confidenceScore(edge.getConfidenceScore())
                        .evidence(edge.getEvidence())
                        .generationMethod(edge.getGenerationMethod())
                        .relationshipSource(edge.getRelationshipSource())
                        .status(edge.getStatus())
                        .createdAt(edge.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/relationships/{relationshipId}")
    public ResponseEntity<Void> deleteRelationship(
            @PathVariable Long relationshipId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        discoveryService.deleteRelationship(relationshipId, userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/relationships/{relationshipId}/confirm")
    public ResponseEntity<Void> confirmRelationship(
            @PathVariable Long relationshipId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        discoveryService.confirmRelationship(relationshipId, userPrincipal.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/relationships/{relationshipId}/reject")
    public ResponseEntity<Void> rejectRelationship(
            @PathVariable Long relationshipId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        discoveryService.rejectRelationship(relationshipId, userPrincipal.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/relationships/manual")
    public ResponseEntity<GraphEdgeResponse> createManualRelationship(
            @RequestBody ManualRelationshipRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        GraphEdge edge = inferenceService.createManualRelationship(
                userPrincipal.getId(),
                request.getSourceNodeId(),
                request.getTargetNodeId(),
                request.getRelationshipType(),
                request.getEvidence()
        );

        GraphEdgeResponse response = GraphEdgeResponse.builder()
                .id(edge.getId())
                .sourceNodeId(edge.getSourceNode().getId())
                .sourceNodeName(edge.getSourceNode().getName())
                .sourceNodeType(edge.getSourceNode().getEntityType())
                .targetNodeId(edge.getTargetNode().getId())
                .targetNodeName(edge.getTargetNode().getName())
                .targetNodeType(edge.getTargetNode().getEntityType())
                .relationshipType(edge.getRelationshipType())
                .confidenceScore(edge.getConfidenceScore())
                .evidence(edge.getEvidence())
                .generationMethod(edge.getGenerationMethod())
                .relationshipSource(edge.getRelationshipSource())
                .status(edge.getStatus())
                .createdAt(edge.getCreatedAt())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/knowledge-graph")
    public ResponseEntity<KnowledgeGraphResponse> getKnowledgeGraph(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        KnowledgeGraphResponse response = discoveryService.getFullUserGraph(userPrincipal.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/knowledge-graph/node/{nodeId}")
    public ResponseEntity<NodeDetailsResponse> getNodeDetails(
            @PathVariable Long nodeId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        NodeDetailsResponse details = discoveryService.getNodeDetails(nodeId, userPrincipal.getId());
        return ResponseEntity.ok(details);
    }

    @GetMapping("/knowledge-graph/neighbors/{nodeId}")
    public ResponseEntity<List<GraphNodeResponse>> getNeighbors(
            @PathVariable Long nodeId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<GraphNodeResponse> neighbors = discoveryService.getNeighbors(nodeId, userPrincipal.getId());
        return ResponseEntity.ok(neighbors);
    }

    @GetMapping("/knowledge-graph/path")
    public ResponseEntity<List<GraphNodeResponse>> findPath(
            @RequestParam Long sourceId,
            @RequestParam Long targetId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<GraphNodeResponse> path = discoveryService.findRelationshipPath(sourceId, targetId, userPrincipal.getId());
        return ResponseEntity.ok(path);
    }
}
