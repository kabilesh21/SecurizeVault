package com.memoryverse.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.memoryverse.dto.*;
import com.memoryverse.entity.*;
import com.memoryverse.exception.ResourceNotFoundException;
import com.memoryverse.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TimelineService {

    private static final Logger logger = LoggerFactory.getLogger(TimelineService.class);

    @Autowired private TimelineEventRepository timelineEventRepository;
    @Autowired private TimelineEventDocumentRepository eventDocumentRepository;
    @Autowired private TimelineInsightRepository insightRepository;
    @Autowired private TimelineMilestoneRepository milestoneRepository;
    @Autowired private TimelineUserPreferenceRepository preferenceRepository;
    @Autowired private SkillRepository skillRepository;
    @Autowired private DocumentRepository documentRepository;
    @Autowired private DocumentSkillRepository documentSkillRepository;
    @Autowired private ExtractedEntityRepository extractedEntityRepository;
    @Autowired private GraphEdgeRepository graphEdgeRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private AITimelineIntegrationService aiIntegrationService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ==============================
    // GENERATE / REBUILD
    // ==============================

    @Transactional
    public String generateTimeline(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        List<Document> documents = documentRepository.findByUserIdOrderByUploadedAtDesc(userId);
        if (documents.isEmpty()) {
            return "NO_DOCUMENTS";
        }

        // Build AI request payload
        AITimelineRequest request = buildAIRequest(userId, user, documents);

        // Call AI service
        AITimelineResponse aiResponse = aiIntegrationService.generateTimeline(request);

        if (aiResponse == null || !"COMPLETED".equals(aiResponse.getProcessingStatus())) {
            logger.warn("AI timeline service unavailable, using local fallback for user {}", userId);
            return generateLocalFallback(userId, user, documents);
        }

        // Persist AI-generated events
        return persistAIResults(userId, user, aiResponse, documents);
    }

    @Transactional
    public String rebuildTimeline(Long userId) {
        // Delete existing AI-generated events, milestones, insights
        timelineEventRepository.deleteAiGeneratedByUserId(userId);
        milestoneRepository.deleteByUserId(userId);
        insightRepository.deleteByUserId(userId);
        return generateTimeline(userId);
    }

    // ==============================
    // QUERY EVENTS
    // ==============================

    public List<TimelineEventResponse> getEvents(Long userId, String eventType, Integer minImportance, String sortBy) {
        List<TimelineEvent> events;

        if (eventType != null && !eventType.isBlank() && !"ALL".equalsIgnoreCase(eventType)) {
            events = timelineEventRepository.findByUserIdAndEventTypeOrderByStartDateAsc(userId, eventType);
        } else if (minImportance != null && minImportance > 0) {
            events = timelineEventRepository.findByUserIdAndMinImportance(userId, minImportance);
        } else {
            events = timelineEventRepository.findActiveEventsByUserId(userId);
        }

        // Collect milestones grouped by event
        List<TimelineMilestone> milestones = milestoneRepository.findByUserIdOrderByImportanceScoreDesc(userId);
        Map<Long, List<String>> milestoneMap = new HashMap<>();
        for (TimelineMilestone m : milestones) {
            milestoneMap.computeIfAbsent(m.getTimelineEvent().getId(), k -> new ArrayList<>()).add(m.getLabel());
        }

        return events.stream().map(e -> mapToResponse(e, milestoneMap)).collect(Collectors.toList());
    }

    public TimelineEventResponse getEventById(Long userId, Long eventId) {
        TimelineEvent event = timelineEventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("TimelineEvent", "id", eventId));

        if (!event.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("TimelineEvent", "id", eventId);
        }

        List<TimelineMilestone> milestones = milestoneRepository.findByUserIdOrderByImportanceScoreDesc(userId);
        Map<Long, List<String>> milestoneMap = new HashMap<>();
        for (TimelineMilestone m : milestones) {
            milestoneMap.computeIfAbsent(m.getTimelineEvent().getId(), k -> new ArrayList<>()).add(m.getLabel());
        }

        return mapToResponse(event, milestoneMap);
    }

    // ==============================
    // EDIT / CONFIRM / HIDE / RESTORE
    // ==============================

    @Transactional
    public TimelineEventResponse updateEvent(Long userId, Long eventId, TimelineEventRequest req) {
        TimelineEvent event = timelineEventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("TimelineEvent", "id", eventId));

        if (!event.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("TimelineEvent", "id", eventId);
        }

        if (req.getTitle() != null) event.setTitle(req.getTitle());
        if (req.getDescription() != null) event.setDescription(req.getDescription());
        if (req.getEventType() != null) event.setEventType(req.getEventType());
        if (req.getStartDate() != null) event.setStartDate(req.getStartDate());
        if (req.getEndDate() != null) event.setEndDate(req.getEndDate());
        if (req.getDisplayDate() != null) event.setDisplayDate(req.getDisplayDate());
        if (req.getOrganization() != null) event.setOrganization(req.getOrganization());
        if (req.getImportanceScore() != null) event.setImportanceScore(req.getImportanceScore());

        timelineEventRepository.save(event);
        return mapToResponse(event, Collections.emptyMap());
    }

    @Transactional
    public void confirmEvent(Long userId, Long eventId) {
        TimelineEvent event = timelineEventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("TimelineEvent", "id", eventId));
        if (!event.getUser().getId().equals(userId)) throw new ResourceNotFoundException("TimelineEvent", "id", eventId);
        event.setIsUserConfirmed(true);
        timelineEventRepository.save(event);
    }

    @Transactional
    public void hideEvent(Long userId, Long eventId) {
        TimelineEvent event = timelineEventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("TimelineEvent", "id", eventId));
        if (!event.getUser().getId().equals(userId)) throw new ResourceNotFoundException("TimelineEvent", "id", eventId);
        event.setEventStatus("HIDDEN");
        timelineEventRepository.save(event);
    }

    @Transactional
    public void restoreEvent(Long userId, Long eventId) {
        TimelineEvent event = timelineEventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("TimelineEvent", "id", eventId));
        if (!event.getUser().getId().equals(userId)) throw new ResourceNotFoundException("TimelineEvent", "id", eventId);
        event.setEventStatus("ACTIVE");
        timelineEventRepository.save(event);
    }

    @Transactional
    public void deleteEvent(Long userId, Long eventId) {
        TimelineEvent event = timelineEventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("TimelineEvent", "id", eventId));
        if (!event.getUser().getId().equals(userId)) throw new ResourceNotFoundException("TimelineEvent", "id", eventId);
        eventDocumentRepository.deleteByTimelineEventId(eventId);
        timelineEventRepository.delete(event);
    }

    @Transactional
    public TimelineEventResponse createManualEvent(Long userId, TimelineEventRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        TimelineEvent event = TimelineEvent.builder()
                .user(user)
                .title(req.getTitle() != null ? req.getTitle() : "Manual Event")
                .description(req.getDescription())
                .eventType(req.getEventType() != null ? req.getEventType() : "OTHER")
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .displayDate(req.getDisplayDate())
                .datePrecision(req.getDatePrecision() != null ? req.getDatePrecision() : "UNKNOWN")
                .dateSource("USER_CREATED")
                .organization(req.getOrganization())
                .importanceScore(req.getImportanceScore() != null ? req.getImportanceScore() : 60)
                .confidenceScore(1.0)
                .eventStatus("ACTIVE")
                .isUserCreated(true)
                .isUserConfirmed(true)
                .build();

        timelineEventRepository.save(event);
        return mapToResponse(event, Collections.emptyMap());
    }

    // ==============================
    // INSIGHTS & MILESTONES
    // ==============================

    public List<TimelineInsightResponse> getInsights(Long userId) {
        return insightRepository.findByUserIdOrderByGeneratedAtDesc(userId).stream()
                .map(i -> TimelineInsightResponse.builder()
                        .id(i.getId())
                        .insightType(i.getInsightType())
                        .title(i.getTitle())
                        .description(i.getDescription())
                        .confidenceScore(i.getConfidenceScore())
                        .build())
                .collect(Collectors.toList());
    }

    public List<TimelineMilestoneResponse> getMilestones(Long userId) {
        return milestoneRepository.findByUserIdOrderByImportanceScoreDesc(userId).stream()
                .map(m -> TimelineMilestoneResponse.builder()
                        .id(m.getId())
                        .timelineEventId(m.getTimelineEvent().getId())
                        .milestoneType(m.getMilestoneType())
                        .label(m.getLabel())
                        .importanceScore(m.getImportanceScore())
                        .build())
                .collect(Collectors.toList());
    }

    // ==============================
    // SUMMARY & STATISTICS
    // ==============================

    public TimelineSummaryResponse getSummary(Long userId) {
        List<TimelineEvent> activeEvents = timelineEventRepository.findActiveEventsByUserId(userId);
        List<TimelineMilestone> milestones = milestoneRepository.findByUserIdOrderByImportanceScoreDesc(userId);

        long certs = activeEvents.stream().filter(e -> "CERTIFICATION".equals(e.getEventType())).count();
        long projs = activeEvents.stream().filter(e -> "PROJECT".equals(e.getEventType())).count();
        long interns = activeEvents.stream().filter(e -> "INTERNSHIP".equals(e.getEventType())).count();
        long github = activeEvents.stream().filter(e -> "GITHUB".equals(e.getEventType())).count();
        long portfolio = activeEvents.stream().filter(e -> "PORTFOLIO".equals(e.getEventType())).count();
        long academic = activeEvents.stream().filter(e -> "ACADEMIC".equals(e.getEventType())).count();

        // Year stats
        int firstYear = 0;
        int latestYear = 0;
        String mostActiveYear = "";

        List<TimelineEvent> sorted = activeEvents.stream()
                .filter(e -> e.getStartDate() != null)
                .sorted(Comparator.comparing(TimelineEvent::getStartDate))
                .collect(Collectors.toList());

        if (!sorted.isEmpty()) {
            firstYear = sorted.get(0).getStartDate().getYear();
            latestYear = sorted.get(sorted.size() - 1).getStartDate().getYear();
            mostActiveYear = activeEvents.stream()
                    .filter(e -> e.getStartDate() != null)
                    .collect(Collectors.groupingBy(e -> String.valueOf(e.getStartDate().getYear()), Collectors.counting()))
                    .entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey).orElse("");
        }

        String latestMilestone = milestones.isEmpty() ? "" : milestones.get(0).getLabel();

        return TimelineSummaryResponse.builder()
                .totalEvents((long) activeEvents.size())
                .activeEvents((long) activeEvents.size())
                .milestoneCount((long) milestones.size())
                .firstYear(firstYear)
                .latestYear(latestYear)
                .mostActiveYear(mostActiveYear)
                .certificatesCount(certs)
                .projectsCount(projs)
                .internshipsCount(interns)
                .githubCount(github)
                .portfolioCount(portfolio)
                .academicCount(academic)
                .latestMilestoneLabel(latestMilestone)
                .build();
    }

    // ==============================
    // PREFERENCES
    // ==============================

    public TimelineUserPreference getOrCreatePreference(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return preferenceRepository.findByUserId(userId).orElseGet(() -> {
            TimelineUserPreference pref = TimelineUserPreference.builder().user(user).build();
            return preferenceRepository.save(pref);
        });
    }

    @Transactional
    public TimelineUserPreference updatePreference(Long userId, TimelinePreferenceRequest req) {
        TimelineUserPreference pref = getOrCreatePreference(userId);
        if (req.getTimelineLayout() != null) pref.setTimelineLayout(req.getTimelineLayout());
        if (req.getShowLowImportance() != null) pref.setShowLowImportance(req.getShowLowImportance());
        if (req.getMinimumImportance() != null) pref.setMinimumImportance(req.getMinimumImportance());
        if (req.getGroupingMode() != null) pref.setGroupingMode(req.getGroupingMode());
        return preferenceRepository.save(pref);
    }

    // ==============================
    // PRIVATE HELPERS
    // ==============================

    private AITimelineRequest buildAIRequest(Long userId, User user, List<Document> documents) {
        List<AITimelineRequest.AITimelineDocumentInput> docInputs = documents.stream()
                .filter(d -> !"FAILED".equals(d.getStatus()))
                .map(d -> AITimelineRequest.AITimelineDocumentInput.builder()
                        .id(d.getId())
                        .title(d.getTitle())
                        .originalName(d.getOriginalName())
                        .category(d.getCategory() != null ? d.getCategory().getName() : null)
                        .ocrText(d.getOcrText() != null ? d.getOcrText().substring(0, Math.min(d.getOcrText().length(), 2000)) : null)
                        .uploadedAt(d.getUploadedAt() != null ? d.getUploadedAt().toString() : null)
                        .build())
                .collect(Collectors.toList());

        // Gather all doc skills for this user
        List<AITimelineRequest.AITimelineSkillInput> skillInputs = new ArrayList<>();
        for (Document doc : documents) {
            documentSkillRepository.findByDocumentId(doc.getId()).forEach(ds ->
                skillInputs.add(AITimelineRequest.AITimelineSkillInput.builder()
                        .name(ds.getSkillName())
                        .confidence(ds.getConfidenceScore())
                        .documentId(doc.getId())
                        .build())
            );
        }

        // Gather extracted entities
        List<AITimelineRequest.AITimelineEntityInput> entityInputs = new ArrayList<>();
        for (Document doc : documents) {
            extractedEntityRepository.findByDocumentId(doc.getId()).forEach(e ->
                entityInputs.add(AITimelineRequest.AITimelineEntityInput.builder()
                        .id(e.getId())
                        .type(e.getEntityType())
                        .value(e.getEntityValue())
                        .confidence(e.getConfidenceScore() != null ? e.getConfidenceScore() : 0.8f)
                        .documentId(doc.getId())
                        .build())
            );
        }

        // Gather graph edges for context
        List<AITimelineRequest.AITimelineRelationshipInput> relInputs = graphEdgeRepository
                .findByUserIdAndStatusNot(userId, "REJECTED").stream()
                .map(edge -> AITimelineRequest.AITimelineRelationshipInput.builder()
                        .id(edge.getId())
                        .sourceNodeId(edge.getSourceNode().getId())
                        .targetNodeId(edge.getTargetNode().getId())
                        .relationshipType(edge.getRelationshipType())
                        .confidenceScore(edge.getConfidenceScore() != null ? edge.getConfidenceScore().floatValue() : 0.7f)
                        .status(edge.getStatus())
                        .build())
                .collect(Collectors.toList());

        return AITimelineRequest.builder()
                .userId(userId)
                .documents(docInputs)
                .skills(skillInputs)
                .entities(entityInputs)
                .relationships(relInputs)
                .build();
    }

    private String persistAIResults(Long userId, User user, AITimelineResponse aiResponse, List<Document> documents) {
        // Build doc ID lookup
        Map<Long, Document> docMap = documents.stream().collect(Collectors.toMap(Document::getId, d -> d));

        // Map tempId -> saved TimelineEvent
        Map<String, TimelineEvent> savedEventMap = new HashMap<>();

        if (aiResponse.getEvents() != null) {
            for (AITimelineResponse.AITimelineEventResult result : aiResponse.getEvents()) {
                TimelineEvent event = TimelineEvent.builder()
                        .user(user)
                        .title(result.getTitle())
                        .description(result.getDescription())
                        .eventType(result.getEventType() != null ? result.getEventType() : "OTHER")
                        .startDate(parseLocalDate(result.getStartDate()))
                        .endDate(parseLocalDate(result.getEndDate()))
                        .displayDate(result.getDisplayDate())
                        .datePrecision(result.getDatePrecision())
                        .dateSource(result.getDateSource())
                        .importanceScore(result.getImportanceScore() != null ? result.getImportanceScore() : 50)
                        .confidenceScore(result.getConfidenceScore() != null ? result.getConfidenceScore() : 0.8)
                        .organization(result.getOrganization())
                        .technologiesJson(toJson(result.getTechnologies()))
                        .keywordsJson(toJson(result.getKeywords()))
                        .eventStatus("ACTIVE")
                        .isUserCreated(false)
                        .isUserConfirmed(false)
                        .build();

                timelineEventRepository.save(event);
                savedEventMap.put(result.getTemporaryId(), event);

                // Link documents
                if (result.getRelatedDocuments() != null) {
                    for (Long docId : result.getRelatedDocuments()) {
                        Document doc = docMap.get(docId);
                        if (doc != null) {
                            TimelineEventDocument ted = TimelineEventDocument.builder()
                                    .timelineEvent(event)
                                    .document(doc)
                                    .build();
                            eventDocumentRepository.save(ted);
                        }
                    }
                }
            }
        }

        // Save milestones
        if (aiResponse.getMilestones() != null) {
            for (AITimelineResponse.AITimelineMilestoneResult m : aiResponse.getMilestones()) {
                TimelineEvent linked = savedEventMap.get(m.getEventTemporaryId());
                if (linked != null) {
                    TimelineMilestone milestone = TimelineMilestone.builder()
                            .user(user)
                            .timelineEvent(linked)
                            .milestoneType(m.getMilestoneType())
                            .label(m.getLabel())
                            .importanceScore(m.getImportanceScore() != null ? m.getImportanceScore() : 70)
                            .build();
                    milestoneRepository.save(milestone);
                }
            }
        }

        // Save insights
        if (aiResponse.getInsights() != null) {
            for (AITimelineResponse.AITimelineInsightResult ins : aiResponse.getInsights()) {
                TimelineInsight insight = TimelineInsight.builder()
                        .user(user)
                        .insightType(ins.getType())
                        .title(ins.getTitle())
                        .description(ins.getDescription())
                        .confidenceScore(ins.getConfidence() != null ? ins.getConfidence() : 0.8)
                        .build();
                insightRepository.save(insight);
            }
        }

        return "COMPLETED";
    }

    private String generateLocalFallback(Long userId, User user, List<Document> documents) {
        // Simple local fallback: create one event per document using basic date extraction
        for (Document doc : documents) {
            if ("FAILED".equals(doc.getStatus())) continue;

            String category = doc.getCategory() != null ? doc.getCategory().getName() : "OTHER";
            String eventType = mapCategoryToEventType(category);
            LocalDate date = doc.getUploadedAt().toLocalDate();

            // Try to extract a date entity
            List<ExtractedEntity> dateEntities = extractedEntityRepository.findByDocumentId(doc.getId()).stream()
                    .filter(e -> "DATE".equals(e.getEntityType()) || "YEAR".equals(e.getEntityType()))
                    .collect(Collectors.toList());

            String dateSource = "UPLOAD_DATE_FALLBACK";
            if (!dateEntities.isEmpty()) {
                LocalDate parsed = parseLocalDate(dateEntities.get(0).getEntityValue());
                if (parsed != null) {
                    date = parsed;
                    dateSource = "DOCUMENT_CONTENT";
                }
            }

            List<DocumentSkill> skills = documentSkillRepository.findByDocumentId(doc.getId());
            String skillStr = skills.stream().limit(3).map(DocumentSkill::getSkillName).collect(Collectors.joining(", "));

            TimelineEvent event = TimelineEvent.builder()
                    .user(user)
                    .title(doc.getTitle())
                    .description("Completed " + doc.getTitle() + (skillStr.isEmpty() ? "." : ", demonstrating skills in " + skillStr + "."))
                    .eventType(eventType)
                    .startDate(date)
                    .displayDate(String.valueOf(date.getYear()))
                    .datePrecision("DAY")
                    .dateSource(dateSource)
                    .importanceScore(60)
                    .confidenceScore(0.75)
                    .organization(extractOrg(doc.getId()))
                    .eventStatus("ACTIVE")
                    .isUserCreated(false)
                    .isUserConfirmed(false)
                    .build();

            timelineEventRepository.save(event);

            TimelineEventDocument ted = TimelineEventDocument.builder()
                    .timelineEvent(event)
                    .document(doc)
                    .build();
            eventDocumentRepository.save(ted);
        }

        return "COMPLETED_FALLBACK";
    }

    private String mapCategoryToEventType(String category) {
        if (category == null) return "OTHER";
        switch (category.toUpperCase()) {
            case "CERTIFICATES": return "CERTIFICATION";
            case "PROJECT_REPORTS": return "PROJECT";
            case "INTERNSHIP_LETTERS": return "INTERNSHIP";
            case "PORTFOLIO_LINKS": return "PORTFOLIO";
            case "GITHUB_REPOS": return "GITHUB";
            case "ACADEMIC_DOCUMENTS": return "ACADEMIC";
            default: return "OTHER";
        }
    }

    private String extractOrg(Long docId) {
        return extractedEntityRepository.findByDocumentId(docId).stream()
                .filter(e -> "ORGANIZATION".equals(e.getEntityType()))
                .findFirst()
                .map(ExtractedEntity::getEntityValue)
                .orElse(null);
    }

    private LocalDate parseLocalDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            String clean = dateStr.trim();
            if (clean.matches("\\d{4}-\\d{2}-\\d{2}")) return LocalDate.parse(clean);
            if (clean.matches("\\d{4}-\\d{2}")) return LocalDate.parse(clean + "-01");
            if (clean.matches("\\d{4}")) return LocalDate.of(Integer.parseInt(clean), 1, 1);
        } catch (Exception ignored) {}
        return null;
    }

    private String toJson(List<String> list) {
        if (list == null || list.isEmpty()) return "[]";
        try {
            return objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            return "[]";
        }
    }

    private List<String> fromJson(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private TimelineEventResponse mapToResponse(TimelineEvent e, Map<Long, List<String>> milestoneMap) {
        // Get related document IDs
        List<Long> docIds = eventDocumentRepository.findByTimelineEventId(e.getId()).stream()
                .map(ted -> ted.getDocument().getId())
                .collect(Collectors.toList());

        // Get related skill names from document skills
        List<String> skillNames = new ArrayList<>();
        for (Long docId : docIds) {
            documentSkillRepository.findByDocumentId(docId).forEach(ds -> skillNames.add(ds.getSkillName()));
        }

        return TimelineEventResponse.builder()
                .id(e.getId())
                .title(e.getTitle())
                .description(e.getDescription())
                .eventType(e.getEventType())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .displayDate(e.getDisplayDate())
                .datePrecision(e.getDatePrecision())
                .dateSource(e.getDateSource())
                .importanceScore(e.getImportanceScore())
                .confidenceScore(e.getConfidenceScore())
                .organization(e.getOrganization())
                .technologies(fromJson(e.getTechnologiesJson()))
                .keywords(fromJson(e.getKeywordsJson()))
                .aiSummary(e.getAiSummary())
                .eventStatus(e.getEventStatus())
                .isUserCreated(e.getIsUserCreated())
                .isUserConfirmed(e.getIsUserConfirmed())
                .relatedDocumentIds(docIds)
                .relatedSkillNames(skillNames.stream().distinct().collect(Collectors.toList()))
                .milestoneLabels(milestoneMap.getOrDefault(e.getId(), Collections.emptyList()))
                .build();
    }
}
