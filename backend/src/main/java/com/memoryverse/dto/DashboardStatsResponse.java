package com.memoryverse.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalDocuments;
    private long certificatesCount;
    private long resumeCount;
    private long projectsCount;
    private long internshipsCount;
    private long portfolioLinksCount;
    private long githubLinksCount;
}
