package com.memoryverse.service;

import com.memoryverse.dto.RelationshipEvidenceResponse;
import com.memoryverse.entity.RelationshipEvidence;
import com.memoryverse.repository.RelationshipEvidenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RelationshipEvidenceService {

    @Autowired
    private RelationshipEvidenceRepository evidenceRepository;

    public List<RelationshipEvidenceResponse> getEvidencesForEdge(Long edgeId) {
        List<RelationshipEvidence> evidences = evidenceRepository.findByRelationshipId(edgeId);
        return evidences.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private RelationshipEvidenceResponse mapToResponse(RelationshipEvidence evidence) {
        return RelationshipEvidenceResponse.builder()
                .id(evidence.getId())
                .relationshipId(evidence.getRelationship().getId())
                .documentId(evidence.getDocument() != null ? evidence.getDocument().getId() : null)
                .documentTitle(evidence.getDocument() != null ? evidence.getDocument().getTitle() : "Manual Entry")
                .evidenceText(evidence.getEvidenceText())
                .evidenceType(evidence.getEvidenceType())
                .relevanceScore(evidence.getRelevanceScore())
                .build();
    }
}
