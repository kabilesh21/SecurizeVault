package com.memoryverse.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchHistoryResponse {
    private Long id;
    private String query;
    private String detectedIntent;
    private Integer resultCount;
    private String searchedAt;
}
