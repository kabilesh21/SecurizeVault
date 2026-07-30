package com.memoryverse;

import com.memoryverse.dto.DocumentAnalysisResponse;
import com.memoryverse.entity.*;
import com.memoryverse.exception.ApiException;
import com.memoryverse.repository.*;
import com.memoryverse.service.AIIntegrationService;
import com.memoryverse.service.CategorizationService;
import com.memoryverse.service.SearchIndexService;
import com.memoryverse.service.RelationshipDiscoveryService;
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
public class CategorizationServiceTest {

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private DocumentCategoryRepository documentCategoryRepository;

    @Mock
    private DocumentSkillRepository documentSkillRepository;

    @Mock
    private ExtractedEntityRepository extractedEntityRepository;

    @Mock
    private CategorizationResultRepository categorizationResultRepository;

    @Mock
    private AIIntegrationService aiIntegrationService;

    @Mock
    private SearchIndexService searchIndexService;

    @Mock
    private RelationshipDiscoveryService relationshipDiscoveryService;

    @InjectMocks
    private CategorizationService categorizationService;

    private User mockUser;
    private Document mockDoc;
    private Category mockCategory;
    private CategorizationResult mockResult;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .username("student")
                .email("student@uni.edu")
                .build();

        mockDoc = Document.builder()
                .id(10L)
                .user(mockUser)
                .title("FitPulse Project Report")
                .originalName("FitPulse_Report.pdf")
                .ocrText("Developed a health monitoring system in Java and Spring Boot.")
                .status("PENDING")
                .build();

        mockCategory = Category.builder()
                .id(3L)
                .name("PROJECT_REPORT")
                .description("Project documentation")
                .icon("FiActivity")
                .build();

        mockResult = CategorizationResult.builder()
                .id(100L)
                .document(mockDoc)
                .primaryCategory("PROJECT_REPORT")
                .overallConfidence(0.96f)
                .processingStatus("COMPLETED")
                .build();
    }

    @Test
    void testAnalyzeDocumentSuccess() {
        // Arrange
        when(documentRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(mockDoc));
        when(categorizationResultRepository.findByDocumentId(10L)).thenReturn(Optional.of(mockResult));
        when(categorizationResultRepository.save(any(CategorizationResult.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(categoryRepository.findByName("PROJECT_REPORT")).thenReturn(Optional.of(mockCategory));

        Map<String, Object> mockAiResponse = new HashMap<>();
        mockAiResponse.put("primaryCategory", "PROJECT_REPORT");
        mockAiResponse.put("primaryConfidence", 0.96);
        
        List<Map<String, Object>> mockSkills = new ArrayList<>();
        Map<String, Object> skill1 = new HashMap<>();
        skill1.put("name", "Java");
        skill1.put("confidence", 0.95);
        mockSkills.add(skill1);
        mockAiResponse.put("skills", mockSkills);

        Map<String, Object> mockEntities = new HashMap<>();
        mockEntities.put("technologies", Collections.singletonList("Java"));
        mockAiResponse.put("entities", mockEntities);

        when(aiIntegrationService.categorizeDocument(anyLong(), anyString(), anyString())).thenReturn(mockAiResponse);

        // Act
        DocumentAnalysisResponse response = categorizationService.analyzeDocumentSync(10L, 1L);

        // Assert
        assertNotNull(response);
        assertEquals("PROJECT_REPORT", response.getPrimaryCategory());
        assertEquals(0.96f, response.getPrimaryConfidence());
        verify(documentRepository, atLeastOnce()).save(any(Document.class));
        verify(categorizationResultRepository, atLeastOnce()).save(any(CategorizationResult.class));
        verify(documentSkillRepository, times(1)).save(any(DocumentSkill.class));
    }

    @Test
    void testCorrectPrimaryCategory() {
        // Arrange
        when(documentRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(mockDoc));
        when(categoryRepository.findById(3L)).thenReturn(Optional.of(mockCategory));
        when(categorizationResultRepository.findByDocumentId(10L)).thenReturn(Optional.of(mockResult));

        // Act
        categorizationService.correctPrimaryCategory(10L, 3L, 1L);

        // Assert
        assertEquals(mockCategory, mockDoc.getCategory());
        assertEquals(mockCategory, mockResult.getCorrectedCategory());
        verify(documentRepository, times(1)).save(mockDoc);
        verify(categorizationResultRepository, times(1)).save(mockResult);
        verify(documentCategoryRepository, times(1)).save(any(DocumentCategory.class));
    }

    @Test
    void testAIIntegrationFailureGracefulHandling() {
        // Arrange
        when(documentRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(mockDoc));
        when(categorizationResultRepository.findByDocumentId(10L)).thenReturn(Optional.of(mockResult));
        when(categorizationResultRepository.save(any(CategorizationResult.class))).thenAnswer(invocation -> invocation.getArgument(0));
        
        // Force AI connection exception
        when(aiIntegrationService.categorizeDocument(anyLong(), anyString(), anyString())).thenReturn(null);

        // Act
        DocumentAnalysisResponse response = categorizationService.analyzeDocumentSync(10L, 1L);

        // Assert
        assertEquals("FAILED", mockDoc.getStatus());
        assertEquals("FAILED", mockResult.getProcessingStatus());
        verify(documentRepository, atLeastOnce()).save(mockDoc);
        verify(categorizationResultRepository, atLeastOnce()).save(mockResult);
    }
}
