package com.memoryverse.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimelineSummaryResponse {
    private Long totalEvents;
    private Long activeEvents;
    private Long milestoneCount;
    private Integer firstYear;
    private Integer latestYear;
    private String mostActiveYear;
    private Long certificatesCount;
    private Long projectsCount;
    private Long internshipsCount;
    private Long githubCount;
    private Long portfolioCount;
    private Long academicCount;
    private String topGrowingSkill;
    private String latestMilestoneLabel;
}
