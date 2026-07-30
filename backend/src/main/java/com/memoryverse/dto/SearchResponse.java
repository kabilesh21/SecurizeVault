package com.memoryverse.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchResponse {
    private String query;
    private String detectedIntent;
    private Double intentConfidence;
    private Map<String, Object> filters;
    private List<SearchResultResponse> results;
    private List<String> suggestions;
    private String processingStatus;
}
