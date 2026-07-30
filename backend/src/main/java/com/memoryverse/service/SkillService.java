package com.memoryverse.service;

import com.memoryverse.dto.DocumentResponse;
import com.memoryverse.entity.DocumentSkill;
import com.memoryverse.repository.DocumentSkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SkillService {

    @Autowired
    private DocumentSkillRepository documentSkillRepository;

    public List<String> getExtractedSkills(Long userId) {
        return documentSkillRepository.findByUserId(userId)
                .stream()
                .map(DocumentSkill::getSkillName)
                .distinct()
                .collect(Collectors.toList());
    }

    public List<DocumentResponse> getDocumentsBySkill(Long userId, String skillName) {
        return documentSkillRepository.findByUserId(userId)
                .stream()
                .filter(ds -> ds.getSkillName().equalsIgnoreCase(skillName))
                .map(DocumentSkill::getDocument)
                .distinct()
                .map(doc -> DocumentResponse.builder()
                        .id(doc.getId())
                        .title(doc.getTitle())
                        .originalName(doc.getOriginalName())
                        .fileType(doc.getFileType())
                        .size(doc.getSize())
                        .category(doc.getCategory() != null ? doc.getCategory().getName() : "UNCLASSIFIED")
                        .status(doc.getStatus())
                        .ocrText(doc.getOcrText())
                        .uploadedAt(doc.getUploadedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
