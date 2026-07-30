package com.memoryverse.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponse {
    private Long id;
    private String title;
    private String originalName;
    private String fileType;
    private Long size;
    private String category;
    private String status;
    private String ocrText;
    private LocalDateTime uploadedAt;
}
