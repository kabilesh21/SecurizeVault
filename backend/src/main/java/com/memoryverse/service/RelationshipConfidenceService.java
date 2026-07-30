package com.memoryverse.service;

import com.memoryverse.entity.GraphEdge;
import org.springframework.stereotype.Service;

@Service
public class RelationshipConfidenceService {

    private static final float DEFAULT_CONFIDENCE_THRESHOLD = 0.70f;

    public boolean isConfident(GraphEdge edge) {
        return edge.getConfidenceScore() >= DEFAULT_CONFIDENCE_THRESHOLD;
    }

    public boolean isConfident(Float confidenceScore) {
        if (confidenceScore == null) {
            return false;
        }
        return confidenceScore >= DEFAULT_CONFIDENCE_THRESHOLD;
    }

    public float calculateConfidence(float entityScore, float skillScore, float semanticScore, float categoryScore) {
        // Weighted average matching Python engine
        return (entityScore * 0.30f) + (skillScore * 0.30f) + (semanticScore * 0.25f) + (categoryScore * 0.15f);
    }
}
