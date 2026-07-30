package com.memoryverse.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.memoryverse.dto.*;
import com.memoryverse.entity.*;
import com.memoryverse.exception.ApiException;
import com.memoryverse.exception.ResourceNotFoundException;
import com.memoryverse.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RelationshipDiscoveryService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private DocumentSkillRepository documentSkillRepository;

    @Autowired
    private ExtractedEntityRepository extractedEntityRepository;

    @Autowired
    private GraphNodeRepository nodeRepository;

    @Autowired
    private GraphEdgeRepository edgeRepository;

    @Autowired
    private RelationshipEvidenceRepository evidenceRepository;

    @Autowired
    private CareerPathRepository careerPathRepository;

    @Autowired
    private UserCareerPathRepository userCareerPathRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AIRelationshipIntegrationService aiIntegrationService;

    @Autowired
    private RelationshipEvidenceService evidenceService;

    @Transactional
    public KnowledgeGraphResponse rebuildUserGraph(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // 1. Gather all documents
        List<Document> documents = documentRepository.findByUserIdOrderByUploadedAtDesc(userId);
        
        // 2. Gather all document skills
        List<DocumentSkill> docSkills = documentSkillRepository.findByUserId(userId);

        // 3. Gather all extracted entities
        List<ExtractedEntity> docEntities = new ArrayList<>();
        for (Document doc : documents) {
            docEntities.addAll(extractedEntityRepository.findByDocumentId(doc.getId()));
        }

        // 4. Build payload for FastAPI service
        List<RelationshipAnalysisRequest.DocumentInput> docPayloads = documents.stream()
                .map(d -> RelationshipAnalysisRequest.DocumentInput.builder()
                        .id(d.getId())
                        .title(d.getTitle())
                        .originalName(d.getOriginalName())
                        .category(d.getCategory() != null ? d.getCategory().getName() : "UNCLASSIFIED")
                        .ocrText(d.getOcrText())
                        .build())
                .collect(Collectors.toList());

        List<RelationshipAnalysisRequest.SkillInput> skillPayloads = docSkills.stream()
                .map(s -> RelationshipAnalysisRequest.SkillInput.builder()
                        .name(s.getSkillName())
                        .confidence(s.getConfidenceScore())
                        .documentId(s.getDocument().getId())
                        .build())
                .collect(Collectors.toList());

        List<RelationshipAnalysisRequest.EntityInput> entityPayloads = docEntities.stream()
                .map(e -> RelationshipAnalysisRequest.EntityInput.builder()
                        .type(e.getEntityType())
                        .value(e.getEntityValue())
                        .confidence(e.getConfidenceScore())
                        .documentId(e.getDocument().getId())
                        .build())
                .collect(Collectors.toList());

        RelationshipAnalysisRequest requestPayload = RelationshipAnalysisRequest.builder()
                .userId(userId)
                .documents(docPayloads)
                .skills(skillPayloads)
                .entities(entityPayloads)
                .build();

        // 5. Connect to Python AI service
        RelationshipAnalysisResponse aiResponse = aiIntegrationService.analyzeRelationships(requestPayload);
        if (aiResponse == null) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "AI relationship engine is currently offline");
        }

        // 6. Process Nodes
        Map<String, GraphNode> tempToDbNodeMap = new HashMap<>();
        for (RelationshipAnalysisResponse.NodeResponse nodeRes : aiResponse.getNodes()) {
            Optional<GraphNode> existingNode;
            if (nodeRes.getReferenceId() != null) {
                existingNode = nodeRepository.findByUserIdAndEntityTypeAndEntityReferenceIdAndName(
                        userId, nodeRes.getType(), nodeRes.getReferenceId(), nodeRes.getName()
                );
            } else {
                existingNode = nodeRepository.findByUserIdAndEntityTypeAndName(
                        userId, nodeRes.getType(), nodeRes.getName()
                );
            }

            GraphNode node;
            if (existingNode.isPresent()) {
                node = existingNode.get();
                // Update description if needed
                node.setDescription(nodeRes.getDescription());
                node = nodeRepository.save(node);
            } else {
                Document docRef = null;
                if (nodeRes.getSourceDocumentId() != null) {
                    docRef = documentRepository.findById(nodeRes.getSourceDocumentId()).orElse(null);
                }

                String metaJson = "";
                if (nodeRes.getMetadata() != null) {
                    try {
                        metaJson = new ObjectMapper().writeValueAsString(nodeRes.getMetadata());
                    } catch (Exception e) {
                        metaJson = "{}";
                    }
                }

                node = GraphNode.builder()
                        .user(user)
                        .entityType(nodeRes.getType())
                        .entityReferenceId(nodeRes.getReferenceId())
                        .name(nodeRes.getName())
                        .normalizedName(nodeRes.getName().toLowerCase())
                        .description(nodeRes.getDescription())
                        .metadataJson(metaJson)
                        .sourceDocument(docRef)
                        .build();
                node = nodeRepository.save(node);
            }
            tempToDbNodeMap.put(nodeRes.getTemporaryId(), node);
        }

        // 7. Process Edges
        for (RelationshipAnalysisResponse.RelationshipResponse edgeRes : aiResponse.getRelationships()) {
            GraphNode sourceNode = tempToDbNodeMap.get(edgeRes.getSource());
            GraphNode targetNode = tempToDbNodeMap.get(edgeRes.getTarget());

            if (sourceNode == null || targetNode == null) {
                continue; // Skip invalid node maps
            }

            Optional<GraphEdge> existingEdge = edgeRepository.findByUserIdAndSourceNodeIdAndTargetNodeIdAndRelationshipType(
                    userId, sourceNode.getId(), targetNode.getId(), edgeRes.getType()
            );

            if (existingEdge.isPresent()) {
                GraphEdge edge = existingEdge.get();
                // Preserve user confirmation / rejection decisions!
                if ("ACTIVE".equals(edge.getStatus())) {
                    edge.setConfidenceScore(edgeRes.getConfidence());
                    edge.setEvidence(edgeRes.getEvidence());
                    edgeRepository.save(edge);
                }
            } else {
                GraphEdge newEdge = GraphEdge.builder()
                        .user(user)
                        .sourceNode(sourceNode)
                        .targetNode(targetNode)
                        .relationshipType(edgeRes.getType())
                        .confidenceScore(edgeRes.getConfidence())
                        .evidence(edgeRes.getEvidence())
                        .generationMethod(edgeRes.getGenerationMethod())
                        .relationshipSource("AI_INFERRED")
                        .status("ACTIVE") // Default pending status
                        .build();

                newEdge = edgeRepository.save(newEdge);

                // Add source document reference evidence if available
                Document sourceDoc = sourceNode.getSourceDocument();
                if (sourceDoc == null) {
                    sourceDoc = targetNode.getSourceDocument();
                }

                RelationshipEvidence evidence = RelationshipEvidence.builder()
                        .relationship(newEdge)
                        .document(sourceDoc)
                        .evidenceText(edgeRes.getEvidence())
                        .evidenceType("AI_ANALYSIS")
                        .relevanceScore(edgeRes.getConfidence())
                        .build();
                evidenceRepository.save(evidence);
            }
        }

        // 8. Process Career Recommendations
        for (RelationshipAnalysisResponse.CareerRecommendation careerRes : aiResponse.getCareerPaths()) {
            Optional<CareerPath> cpOpt = careerPathRepository.findByName(careerRes.getName());
            if (cpOpt.isPresent()) {
                CareerPath cp = cpOpt.get();
                Optional<UserCareerPath> ucpOpt = userCareerPathRepository.findByUserIdAndCareerPathId(userId, cp.getId());

                if (ucpOpt.isPresent()) {
                    UserCareerPath ucp = ucpOpt.get();
                    ucp.setConfidenceScore(careerRes.getConfidence());
                    ucp.setReason(careerRes.getReason());
                    userCareerPathRepository.save(ucp);
                } else {
                    UserCareerPath ucp = UserCareerPath.builder()
                            .user(user)
                            .careerPath(cp)
                            .confidenceScore(careerRes.getConfidence())
                            .reason(careerRes.getReason())
                            .status("RECOMMENDED")
                            .build();
                    userCareerPathRepository.save(ucp);
                }
            }
        }

        return getFullUserGraph(userId);
    }

    public KnowledgeGraphResponse getFullUserGraph(Long userId) {
        List<GraphNode> dbNodes = nodeRepository.findByUserId(userId);
        List<GraphEdge> dbEdges = edgeRepository.findByUserId(userId);

        // Filter out rejected relationships by default
        List<GraphEdge> activeEdges = dbEdges.stream()
                .filter(e -> !"REJECTED".equals(e.getStatus()))
                .collect(Collectors.toList());

        List<GraphNodeResponse> nodeResponses = dbNodes.stream()
                .map(this::mapNodeToResponse)
                .collect(Collectors.toList());

        List<GraphEdgeResponse> edgeResponses = activeEdges.stream()
                .map(this::mapEdgeToResponse)
                .collect(Collectors.toList());

        return KnowledgeGraphResponse.builder()
                .nodes(nodeResponses)
                .edges(edgeResponses)
                .build();
    }

    public void confirmRelationship(Long relationshipId, Long userId) {
        GraphEdge edge = edgeRepository.findById(relationshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Relationship", "id", relationshipId));

        if (!edge.getUser().getId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Unauthorized relationship access");
        }

        edge.setStatus("CONFIRMED");
        edge.setRelationshipSource("USER_CONFIRMED");
        edgeRepository.save(edge);
    }

    public void rejectRelationship(Long relationshipId, Long userId) {
        GraphEdge edge = edgeRepository.findById(relationshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Relationship", "id", relationshipId));

        if (!edge.getUser().getId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Unauthorized relationship access");
        }

        edge.setStatus("REJECTED");
        edge.setRelationshipSource("USER_CORRECTED");
        edgeRepository.save(edge);
    }

    public void deleteRelationship(Long relationshipId, Long userId) {
        GraphEdge edge = edgeRepository.findById(relationshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Relationship", "id", relationshipId));

        if (!edge.getUser().getId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Unauthorized relationship access");
        }

        edgeRepository.delete(edge);
    }

    public NodeDetailsResponse getNodeDetails(Long nodeId, Long userId) {
        GraphNode node = nodeRepository.findById(nodeId)
                .orElseThrow(() -> new ResourceNotFoundException("GraphNode", "id", nodeId));

        if (!node.getUser().getId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Unauthorized node access");
        }

        List<GraphEdge> connectedEdges = edgeRepository.findBySourceNodeIdOrTargetNodeId(nodeId, nodeId);
        List<GraphEdge> activeEdges = connectedEdges.stream()
                .filter(e -> e.getUser().getId().equals(userId) && !"REJECTED".equals(e.getStatus()))
                .collect(Collectors.toList());

        List<DocumentResponse> relatedDocs = new ArrayList<>();
        if (node.getSourceDocument() != null) {
            relatedDocs.add(mapDocToResponse(node.getSourceDocument()));
        }

        List<GraphEdgeResponse> edgeResponses = activeEdges.stream()
                .map(this::mapEdgeToResponse)
                .collect(Collectors.toList());

        return NodeDetailsResponse.builder()
                .id(node.getId())
                .name(node.getName())
                .type(node.getEntityType())
                .description(node.getDescription())
                .metadataJson(node.getMetadataJson())
                .relationsCount(activeEdges.size())
                .relatedDocuments(relatedDocs)
                .connectedRelationships(edgeResponses)
                .source(node.getSourceDocument() != null ? "AI_EXTRACTED" : "SYSTEM")
                .build();
    }

    public List<GraphNodeResponse> getNeighbors(Long nodeId, Long userId) {
        GraphNode node = nodeRepository.findById(nodeId)
                .orElseThrow(() -> new ResourceNotFoundException("GraphNode", "id", nodeId));

        if (!node.getUser().getId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Unauthorized node access");
        }

        List<GraphEdge> edges = edgeRepository.findBySourceNodeIdOrTargetNodeId(nodeId, nodeId);
        List<GraphNode> neighbors = new ArrayList<>();

        for (GraphEdge e : edges) {
            if (!e.getUser().getId().equals(userId) || "REJECTED".equals(e.getStatus())) {
                continue;
            }
            if (e.getSourceNode().getId().equals(nodeId)) {
                neighbors.add(e.getTargetNode());
            } else {
                neighbors.add(e.getSourceNode());
            }
        }

        return neighbors.stream()
                .map(this::mapNodeToResponse)
                .collect(Collectors.toList());
    }

    // Shortest path between two nodes (Breadth-First Search)
    public List<GraphNodeResponse> findRelationshipPath(Long sourceId, Long targetId, Long userId) {
        GraphNode source = nodeRepository.findById(sourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Source node", "id", sourceId));
        GraphNode target = nodeRepository.findById(targetId)
                .orElseThrow(() -> new ResourceNotFoundException("Target node", "id", targetId));

        if (!source.getUser().getId().equals(userId) || !target.getUser().getId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Unauthorized access to path nodes");
        }

        Queue<List<GraphNode>> queue = new LinkedList<>();
        Set<Long> visited = new HashSet<>();

        queue.add(Collections.singletonList(source));
        visited.add(sourceId);

        while (!queue.isEmpty()) {
            List<GraphNode> path = queue.poll();
            GraphNode lastNode = path.get(path.size() - 1);

            if (lastNode.getId().equals(targetId)) {
                return path.stream().map(this::mapNodeToResponse).collect(Collectors.toList());
            }

            // Find neighbors
            List<GraphEdge> edges = edgeRepository.findBySourceNodeIdOrTargetNodeId(lastNode.getId(), lastNode.getId());
            for (GraphEdge e : edges) {
                if (!e.getUser().getId().equals(userId) || "REJECTED".equals(e.getStatus())) {
                    continue;
                }
                GraphNode neighbor = e.getSourceNode().getId().equals(lastNode.getId()) ? e.getTargetNode() : e.getSourceNode();
                if (!visited.contains(neighbor.getId())) {
                    visited.add(neighbor.getId());
                    List<GraphNode> newPath = new ArrayList<>(path);
                    newPath.add(neighbor);
                    queue.add(newPath);
                }
            }
        }

        return Collections.emptyList(); // No path found
    }

    private GraphNodeResponse mapNodeToResponse(GraphNode node) {
        return GraphNodeResponse.builder()
                .id(node.getId())
                .entityType(node.getEntityType())
                .entityReferenceId(node.getEntityReferenceId())
                .name(node.getName())
                .normalizedName(node.getNormalizedName())
                .description(node.getDescription())
                .metadataJson(node.getMetadataJson())
                .sourceDocumentId(node.getSourceDocument() != null ? node.getSourceDocument().getId() : null)
                .createdAt(node.getCreatedAt())
                .updatedAt(node.getUpdatedAt())
                .build();
    }

    private GraphEdgeResponse mapEdgeToResponse(GraphEdge edge) {
        return GraphEdgeResponse.builder()
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
    }

    private DocumentResponse mapDocToResponse(Document doc) {
        return DocumentResponse.builder()
                .id(doc.getId())
                .title(doc.getTitle())
                .originalName(doc.getOriginalName())
                .fileType(doc.getFileType())
                .size(doc.getSize())
                .category(doc.getCategory() != null ? doc.getCategory().getName() : "UNCLASSIFIED")
                .status(doc.getStatus())
                .uploadedAt(doc.getUploadedAt())
                .build();
    }
}
