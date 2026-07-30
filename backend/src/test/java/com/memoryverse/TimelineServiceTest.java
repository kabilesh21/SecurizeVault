package com.memoryverse;

import com.memoryverse.dto.*;
import com.memoryverse.entity.*;
import com.memoryverse.repository.*;
import com.memoryverse.service.AITimelineIntegrationService;
import com.memoryverse.service.TimelineService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TimelineServiceTest {

    // ── Repositories ──────────────────────────────────────────────────
    @Mock private TimelineEventRepository timelineEventRepository;
    @Mock private TimelineEventDocumentRepository eventDocumentRepository;
    @Mock private TimelineInsightRepository insightRepository;
    @Mock private TimelineMilestoneRepository milestoneRepository;
    @Mock private TimelineUserPreferenceRepository preferenceRepository;
    @Mock private SkillRepository skillRepository;
    @Mock private DocumentRepository documentRepository;
    @Mock private DocumentSkillRepository documentSkillRepository;
    @Mock private ExtractedEntityRepository extractedEntityRepository;
    @Mock private GraphEdgeRepository graphEdgeRepository;
    @Mock private UserRepository userRepository;
    @Mock private AITimelineIntegrationService aiIntegrationService;

    @InjectMocks
    private TimelineService timelineService;

    // ── Test fixtures ──────────────────────────────────────────────────
    private User mockUser;
    private Document mockDoc;
    private TimelineEvent mockEvent;

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
                .title("Python Core Certificate")
                .originalName("python_cert.pdf")
                .status("PROCESSED")
                .uploadedAt(LocalDateTime.of(2025, 6, 15, 10, 0))
                .build();

        mockEvent = TimelineEvent.builder()
                .id(200L)
                .user(mockUser)
                .eventType("CERTIFICATION")
                .title("Python Core Certificate")
                .description("AI-generated certification milestone")
                .startDate(LocalDate.of(2025, 4, 10))
                .displayDate("April 2025")
                .importanceScore(70)
                .confidenceScore(0.85)
                .eventStatus("ACTIVE")
                .isUserCreated(false)
                .isUserConfirmed(false)
                .build();
    }

    // ── generateTimeline ───────────────────────────────────────────────

    @Test
    void testGenerateTimelineReturnsNoDocumentsWhenEmpty() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(documentRepository.findByUserIdOrderByUploadedAtDesc(1L)).thenReturn(Collections.emptyList());

        String result = timelineService.generateTimeline(1L);

        assertEquals("NO_DOCUMENTS", result);
        verify(aiIntegrationService, never()).generateTimeline(any());
    }

    @Test
    void testGenerateTimelineCallsAIServiceWhenDocumentsExist() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(documentRepository.findByUserIdOrderByUploadedAtDesc(1L)).thenReturn(List.of(mockDoc));
        when(documentSkillRepository.findByDocumentId(100L)).thenReturn(Collections.emptyList());
        when(extractedEntityRepository.findByDocumentId(100L)).thenReturn(Collections.emptyList());
        when(graphEdgeRepository.findByUserIdAndStatusNot(1L, "REJECTED")).thenReturn(Collections.emptyList());

        // AI service returns null → triggers local fallback
        when(aiIntegrationService.generateTimeline(any())).thenReturn(null);

        String result = timelineService.generateTimeline(1L);

        // Should fall back to local generation
        assertEquals("COMPLETED_FALLBACK", result);
        verify(aiIntegrationService, times(1)).generateTimeline(any());
    }

    @Test
    void testGenerateTimelineUsesAIResultWhenAvailable() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(documentRepository.findByUserIdOrderByUploadedAtDesc(1L)).thenReturn(List.of(mockDoc));
        when(documentSkillRepository.findByDocumentId(100L)).thenReturn(Collections.emptyList());
        when(extractedEntityRepository.findByDocumentId(100L)).thenReturn(Collections.emptyList());
        when(graphEdgeRepository.findByUserIdAndStatusNot(1L, "REJECTED")).thenReturn(Collections.emptyList());
        when(timelineEventRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        // Build a minimal AI response
        AITimelineResponse.AITimelineEventResult eventResult = AITimelineResponse.AITimelineEventResult.builder()
                .temporaryId("tmp-1")
                .title("Python Certificate")
                .eventType("CERTIFICATION")
                .startDate("2025-04-10")
                .displayDate("April 2025")
                .importanceScore(75)
                .confidenceScore(0.90)
                .relatedDocuments(List.of(100L))
                .relatedSkills(List.of("Python"))
                .build();

        AITimelineResponse aiResponse = AITimelineResponse.builder()
                .events(List.of(eventResult))
                .milestones(Collections.emptyList())
                .insights(Collections.emptyList())
                .processingStatus("COMPLETED")
                .build();

        when(aiIntegrationService.generateTimeline(any())).thenReturn(aiResponse);

        String result = timelineService.generateTimeline(1L);

        assertEquals("COMPLETED", result);
        verify(timelineEventRepository, times(1)).save(any(TimelineEvent.class));
    }

    // ── getEvents ──────────────────────────────────────────────────────

    @Test
    void testGetEventsReturnsActiveEvents() {
        when(timelineEventRepository.findActiveEventsByUserId(1L)).thenReturn(List.of(mockEvent));
        when(milestoneRepository.findByUserIdOrderByImportanceScoreDesc(1L)).thenReturn(Collections.emptyList());
        when(eventDocumentRepository.findByTimelineEventId(200L)).thenReturn(Collections.emptyList());

        List<TimelineEventResponse> events = timelineService.getEvents(1L, null, null, null);

        assertNotNull(events);
        assertEquals(1, events.size());
        assertEquals("Python Core Certificate", events.get(0).getTitle());
        assertEquals("CERTIFICATION", events.get(0).getEventType());
    }

    @Test
    void testGetEventsFiltersbyEventType() {
        when(timelineEventRepository.findByUserIdAndEventTypeOrderByStartDateAsc(1L, "CERTIFICATION"))
                .thenReturn(List.of(mockEvent));
        when(milestoneRepository.findByUserIdOrderByImportanceScoreDesc(1L)).thenReturn(Collections.emptyList());
        when(eventDocumentRepository.findByTimelineEventId(200L)).thenReturn(Collections.emptyList());

        List<TimelineEventResponse> events = timelineService.getEvents(1L, "CERTIFICATION", null, null);

        assertEquals(1, events.size());
        assertEquals("CERTIFICATION", events.get(0).getEventType());
    }

    // ── getSummary ─────────────────────────────────────────────────────

    @Test
    void testGetSummaryCountsCorrectly() {
        when(timelineEventRepository.findActiveEventsByUserId(1L)).thenReturn(List.of(mockEvent));
        when(milestoneRepository.findByUserIdOrderByImportanceScoreDesc(1L)).thenReturn(Collections.emptyList());

        TimelineSummaryResponse summary = timelineService.getSummary(1L);

        assertNotNull(summary);
        assertEquals(1L, summary.getTotalEvents());
        assertEquals(1L, summary.getCertificatesCount());
        assertEquals(0L, summary.getProjectsCount());
        assertEquals(2025, summary.getFirstYear());
    }

    @Test
    void testGetSummaryIsEmptyWhenNoEvents() {
        when(timelineEventRepository.findActiveEventsByUserId(1L)).thenReturn(Collections.emptyList());
        when(milestoneRepository.findByUserIdOrderByImportanceScoreDesc(1L)).thenReturn(Collections.emptyList());

        TimelineSummaryResponse summary = timelineService.getSummary(1L);

        assertEquals(0L, summary.getTotalEvents());
        assertEquals(0, summary.getFirstYear());
    }

    // ── createManualEvent ──────────────────────────────────────────────

    @Test
    void testCreateManualEventSavesCorrectly() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(timelineEventRepository.save(any())).thenAnswer(i -> {
            TimelineEvent e = i.getArgument(0);
            e = TimelineEvent.builder()
                    .id(999L)
                    .user(e.getUser())
                    .title(e.getTitle())
                    .eventType(e.getEventType())
                    .isUserCreated(true)
                    .eventStatus("ACTIVE")
                    .build();
            return e;
        });

        TimelineEventRequest req = TimelineEventRequest.builder()
                .title("My Hackathon Award")
                .eventType("ACHIEVEMENT")
                .organization("University")
                .importanceScore(85)
                .build();

        TimelineEventResponse response = timelineService.createManualEvent(1L, req);

        assertNotNull(response);
        assertEquals("My Hackathon Award", response.getTitle());
    }

    // ── preferences ───────────────────────────────────────────────────

    @Test
    void testGetOrCreatePreferenceCreatesDefault() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(preferenceRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(preferenceRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        TimelineUserPreference pref = timelineService.getOrCreatePreference(1L);

        assertNotNull(pref);
        verify(preferenceRepository, times(1)).save(any(TimelineUserPreference.class));
    }

    @Test
    void testGetOrCreatePreferenceReturnsExisting() {
        TimelineUserPreference existing = TimelineUserPreference.builder()
                .id(1L)
                .user(mockUser)
                .timelineLayout("COMPACT")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(preferenceRepository.findByUserId(1L)).thenReturn(Optional.of(existing));

        TimelineUserPreference pref = timelineService.getOrCreatePreference(1L);

        assertEquals("COMPACT", pref.getTimelineLayout());
        verify(preferenceRepository, never()).save(any());
    }
}
