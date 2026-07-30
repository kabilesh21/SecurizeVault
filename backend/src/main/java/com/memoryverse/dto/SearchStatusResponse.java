package com.memoryverse.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchStatusResponse {
    private String status;
    private Integer documentsIndexed;
    private String mode;
}
