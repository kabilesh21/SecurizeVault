package com.memoryverse;

import com.memoryverse.dto.*;
import com.memoryverse.entity.*;
import com.memoryverse.repository.*;
import com.memoryverse.service.SearchHistoryService;
import com.memoryverse.service.SmartRetrievalService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SmartRetrievalServiceTest {

    @Mock private DocumentRepository documentRepository;
    @Mock private DocumentSkillRepository documentSkillRepository;
    @Mock private TimelineEventRepository timelineEventRepository;
    @Mock private GraphNodeRepository graphNodeRepository;
    @Mock private SearchHistoryService searchHistoryService;

    @InjectMocks
    private SmartRetrievalService smartRetrievalService;

    private User mockUser;
    private Document mockDoc;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .username("student")
                .email("student@uni.edu")
                .build();

        mockDoc = Document.builder()
                .id(100L)
                .user(mockUser)
                .title("Spring Boot Core Project")
                .originalName("spring_boot_project.pdf")
                .ocrText("Project report on building Spring Boot backend applications with JPA and security.")
                .status("PROCESSED")
                .uploadedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void testPerformSearchEmptyQueryReturnsEmpty() {
        SearchResponse response = smartRetrievalService.performSearch("", 1L);
        assertNotNull(response);
        assertEquals("EMPTY", response.getProcessingStatus());
        assertTrue(response.getResults().isEmpty());
    }

    @Test
    void testPerformSearchTriggersLocalFallbackIfServiceOffline() {
        // Arrange
        when(documentRepository.findByUserIdOrderByUploadedAtDesc(1L)).thenReturn(List.of(mockDoc));
        when(documentSkillRepository.findByDocumentId(100L)).thenReturn(Collections.emptyList());
        when(timelineEventRepository.findByUserIdOrderByStartDateAsc(1L)).thenReturn(Collections.emptyList());
        when(graphNodeRepository.findByUserId(1L)).thenReturn(Collections.emptyList());

        // Act - this will fail to call RestTemplate (which is not mocked to return OK) and fall back
        SearchResponse response = smartRetrievalService.performSearch("Spring Boot", 1L);

        // Assert
        assertNotNull(response);
        assertEquals("COMPLETED_FALLBACK", response.getProcessingStatus());
        assertEquals(1, response.getResults().size());
        assertEquals("Spring Boot Core Project", response.getResults().get(0).getTitle());
        verify(searchHistoryService, times(1)).addHistoryEntry(eq(1L), eq("Spring Boot"), anyString(), eq(1));
    }

    @Test
    void testPerformSearchWithNonMatchingQueryReturnsNoResults() {
        when(documentRepository.findByUserIdOrderByUploadedAtDesc(1L)).thenReturn(List.of(mockDoc));
        when(documentSkillRepository.findByDocumentId(100L)).thenReturn(Collections.emptyList());

        SearchResponse response = smartRetrievalService.performSearch("Nonexistent Topic", 1L);

        assertNotNull(response);
        assertEquals("COMPLETED_FALLBACK", response.getProcessingStatus());
        assertTrue(response.getResults().isEmpty());
    }
}
