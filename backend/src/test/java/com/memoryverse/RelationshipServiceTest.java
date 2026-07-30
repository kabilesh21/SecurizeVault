package com.memoryverse;

import com.memoryverse.dto.KnowledgeGraphResponse;
import com.memoryverse.dto.RelationshipAnalysisResponse;
import com.memoryverse.entity.*;
import com.memoryverse.exception.ApiException;
import com.memoryverse.repository.*;
import com.memoryverse.service.AIRelationshipIntegrationService;
import com.memoryverse.service.RelationshipDiscoveryService;
import com.memoryverse.service.RelationshipInferenceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RelationshipServiceTest {

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private DocumentSkillRepository documentSkillRepository;

    @Mock
    private ExtractedEntityRepository extractedEntityRepository;

    @Mock
    private GraphNodeRepository nodeRepository;

    @Mock
    private GraphEdgeRepository edgeRepository;

    @Mock
    private RelationshipEvidenceRepository evidenceRepository;

    @Mock
    private CareerPathRepository careerPathRepository;

    @Mock
    private UserCareerPathRepository userCareerPathRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AIRelationshipIntegrationService aiIntegrationService;

    @InjectMocks
    private RelationshipDiscoveryService discoveryService;

    @InjectMocks
    private RelationshipInferenceService inferenceService;

    private User mockUser;
    private GraphNode mockSourceNode;
    private GraphNode mockTargetNode;
    private GraphEdge mockEdge;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .username("student")
                .email("student@uni.edu")
                .build();

        mockSourceNode = GraphNode.builder()
                .id(100L)
                .user(mockUser)
                .entityType("SKILL")
                .name("Java")
                .build();

        mockTargetNode = GraphNode.builder()
                .id(200L)
                .user(mockUser)
                .entityType("PROJECT")
                .name("FitPulse Health Tracker")
                .build();

        mockEdge = GraphEdge.builder()
                .id(300L)
                .user(mockUser)
                .sourceNode(mockSourceNode)
                .targetNode(mockTargetNode)
                .relationshipType("CONTRIBUTES_TO")
                .confidenceScore(0.95f)
                .status("ACTIVE")
                .build();
    }

    @Test
    void testConfirmRelationshipSuccess() {
        // Arrange
        when(edgeRepository.findById(300L)).thenReturn(Optional.of(mockEdge));

        // Act
        discoveryService.confirmRelationship(300L, 1L);

        // Assert
        assertEquals("CONFIRMED", mockEdge.getStatus());
        assertEquals("USER_CONFIRMED", mockEdge.getRelationshipSource());
        verify(edgeRepository, times(1)).save(mockEdge);
    }

    @Test
    void testRejectRelationshipSuccess() {
        // Arrange
        when(edgeRepository.findById(300L)).thenReturn(Optional.of(mockEdge));

        // Act
        discoveryService.rejectRelationship(300L, 1L);

        // Assert
        assertEquals("REJECTED", mockEdge.getStatus());
        assertEquals("USER_CORRECTED", mockEdge.getRelationshipSource());
        verify(edgeRepository, times(1)).save(mockEdge);
    }

    @Test
    void testConfirmRelationshipUnauthorizedThrowsException() {
        // Arrange
        when(edgeRepository.findById(300L)).thenReturn(Optional.of(mockEdge));

        // Act & Assert
        assertThrows(ApiException.class, () -> {
            discoveryService.confirmRelationship(300L, 999L); // Wrong user ID
        });
    }

    @Test
    void testCreateManualRelationshipSuccess() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(nodeRepository.findById(100L)).thenReturn(Optional.of(mockSourceNode));
        when(nodeRepository.findById(200L)).thenReturn(Optional.of(mockTargetNode));
        when(edgeRepository.findByUserIdAndSourceNodeIdAndTargetNodeIdAndRelationshipType(1L, 100L, 200L, "CONTRIBUTES_TO"))
                .thenReturn(Optional.empty());
        when(edgeRepository.save(any(GraphEdge.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        GraphEdge edge = inferenceService.createManualRelationship(1L, 100L, 200L, "CONTRIBUTES_TO", "Used Java extensively in FitPulse");

        // Assert
        assertNotNull(edge);
        assertEquals("CONFIRMED", edge.getStatus());
        assertEquals("USER_CREATED", edge.getRelationshipSource());
        assertEquals("MANUAL", edge.getGenerationMethod());
    }

    @Test
    void testAIIntegrationFailureThrowsExceptionGracefully() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(documentRepository.findByUserIdOrderByUploadedAtDesc(1L)).thenReturn(Collections.emptyList());
        
        // Force offline response from AI integration
        when(aiIntegrationService.analyzeRelationships(any())).thenReturn(null);

        // Act & Assert
        ApiException ex = assertThrows(ApiException.class, () -> {
            discoveryService.rebuildUserGraph(1L);
        });
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, ex.getStatus());
    }
}
