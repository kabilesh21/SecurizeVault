package com.memoryverse.service;

import com.memoryverse.dto.DashboardStatsResponse;
import com.memoryverse.dto.DocumentResponse;
import com.memoryverse.dto.UserProfileResponse;
import com.memoryverse.dto.UpdateProfileRequest;
import com.memoryverse.entity.Category;
import com.memoryverse.entity.Document;
import com.memoryverse.entity.PortfolioLink;
import com.memoryverse.entity.User;
import com.memoryverse.exception.ApiException;
import com.memoryverse.exception.ResourceNotFoundException;
import com.memoryverse.repository.CategoryRepository;
import com.memoryverse.repository.DocumentRepository;
import com.memoryverse.repository.PortfolioLinkRepository;
import com.memoryverse.repository.UserRepository;
import com.memoryverse.repository.GraphNodeRepository;
import com.memoryverse.entity.GraphNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private PortfolioLinkRepository portfolioLinkRepository;

    @Autowired
    private AIService aiService;

    @Autowired
    private CategorizationService categorizationService;

    @Autowired
    private GraphNodeRepository nodeRepository;

    @Autowired
    private SearchIndexService searchIndexService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    private final List<String> ALLOWED_FILE_TYPES = Arrays.asList(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/png",
            "image/jpeg",
            "image/jpg"
    );

    public DocumentResponse uploadDocument(MultipartFile file, Long userId) {
        // Validation
        if (file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_FILE_TYPES.contains(contentType)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unsupported file type: " + contentType);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        try {
            // Setup target path
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null) {
                originalFilename = "unnamed_file";
            }

            String storedName = UUID.randomUUID().toString() + "_" + originalFilename;
            Path targetLocation = uploadPath.resolve(storedName);

            // Copy file to directory
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Save basic entity in pending state
            Document document = Document.builder()
                    .user(user)
                    .title(originalFilename.split("\\.")[0])
                    .originalName(originalFilename)
                    .storedName(storedName)
                    .filePath(targetLocation.toString())
                    .fileType(contentType)
                    .size(file.getSize())
                    .status("PENDING")
                    .build();

            document = documentRepository.save(document);

            // Trigger Ingestion & AI Flow Asynchronously in background to return upload response instantly
            final Document finalDoc = document;
            final byte[] fileBytes = file.getBytes();
            java.util.concurrent.CompletableFuture.runAsync(() -> {
                try {
                    processDocumentAI(finalDoc, fileBytes);
                    categorizationService.analyzeDocumentSync(finalDoc.getId(), userId);
                } catch (Exception e) {
                    System.err.println("Async document upload processing failed: " + e.getMessage());
                }
            });

            return mapToResponse(document);
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store file. Error: " + e.getMessage());
        }
    }

    private void processDocumentAI(Document document, byte[] fileBytes) {
        try {
            // 1. Run Mock OCR
            String ocrText = aiService.performOcr(document.getOriginalName(), fileBytes);
            document.setOcrText(ocrText);

            // 2. Extract Metadata & Classify Category
            Map<String, Object> metadata = aiService.extractMetadata(document.getOriginalName(), ocrText);
            String categoryStr = (String) metadata.getOrDefault("category", "OTHER_ACADEMIC");
            
            // Map FastAPI category string to DB Category
            Category category = categoryRepository.findByName(categoryStr)
                    .orElseGet(() -> categoryRepository.findByName("OTHER_ACADEMIC").orElse(null));

            document.setCategory(category);
            document.setStatus("PROCESSED");

            // Update title if FastAPI extracted one
            String extractedTitle = (String) metadata.get("title");
            if (extractedTitle != null && !extractedTitle.isEmpty()) {
                document.setTitle(extractedTitle);
            }

            documentRepository.save(document);

            // 3. Trigger Mock Embeddings
            aiService.triggerEmbeddings(ocrText);

        } catch (Exception e) {
            document.setStatus("FAILED");
            documentRepository.save(document);
            System.err.println("AI ingestion pipeline failed for document ID: " + document.getId() + ". Error: " + e.getMessage());
        }
    }

    public List<DocumentResponse> getDocuments(Long userId) {
        return documentRepository.findByUserIdOrderByUploadedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public DocumentResponse getDocumentById(Long documentId, Long userId) {
        Document document = documentRepository.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));
        return mapToResponse(document);
    }

    public Path getFilePath(Long documentId, Long userId) {
        Document document = documentRepository.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));
        return Paths.get(document.getFilePath());
    }

    public DocumentResponse replaceDocument(Long documentId, MultipartFile file, Long userId) {
        // Delete original file from file system first
        Document document = documentRepository.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));

        try {
            Path path = Paths.get(document.getFilePath());
            Files.deleteIfExists(path);
        } catch (IOException e) {
            System.err.println("Could not delete old file from disk: " + e.getMessage());
        }

        // Validate new file
        if (file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "File is empty");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_FILE_TYPES.contains(contentType)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unsupported file type: " + contentType);
        }

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            String originalFilename = file.getOriginalFilename();
            String storedName = UUID.randomUUID().toString() + "_" + originalFilename;
            Path targetLocation = uploadPath.resolve(storedName);

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            document.setTitle(originalFilename.split("\\.")[0]);
            document.setOriginalName(originalFilename);
            document.setStoredName(storedName);
            document.setFilePath(targetLocation.toString());
            document.setFileType(contentType);
            document.setSize(file.getSize());
            document.setStatus("PENDING");

            document = documentRepository.save(document);

            // Trigger Ingestion & AI Flow Asynchronously in background to return replace response instantly
            final Document finalDoc = document;
            final byte[] fileBytes = file.getBytes();
            java.util.concurrent.CompletableFuture.runAsync(() -> {
                try {
                    processDocumentAI(finalDoc, fileBytes);
                    categorizationService.analyzeDocumentSync(finalDoc.getId(), userId);
                } catch (Exception e) {
                    System.err.println("Async document replacement processing failed: " + e.getMessage());
                }
            });

            return mapToResponse(document);
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not replace file. Error: " + e.getMessage());
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteDocument(Long documentId, Long userId) {
        Document document = documentRepository.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));

        // Delete from local disk
        try {
            Path path = Paths.get(document.getFilePath());
            Files.deleteIfExists(path);
        } catch (IOException e) {
            System.err.println("Could not delete file from disk: " + e.getMessage());
        }

        // Clear graph nodes for this document
        try {
            List<GraphNode> nodes = nodeRepository.findByUserId(userId);
            for (GraphNode node : nodes) {
                if (documentId.equals(node.getEntityReferenceId()) && 
                    ("DOCUMENT".equals(node.getEntityType()) || "CERTIFICATE".equals(node.getEntityType()) || 
                     "PROJECT".equals(node.getEntityType()) || "INTERNSHIP".equals(node.getEntityType()) || 
                     "RESUME".equals(node.getEntityType()))) {
                    nodeRepository.delete(node);
                }
            }
        } catch (Exception e) {
            System.err.println("Could not delete graph nodes: " + e.getMessage());
        }

        // Clear from search index
        try {
            searchIndexService.deleteDocumentFromIndex(documentId, userId);
        } catch (Exception e) {
            System.err.println("Could not delete document from search index: " + e.getMessage());
        }

        // Manually delete database references before deleting the parent document
        documentRepository.deleteCategorizationResultsByDocId(documentId);
        documentRepository.deleteDocumentCategoriesByDocId(documentId);
        documentRepository.deleteDocumentSkillsByDocId(documentId);
        documentRepository.deleteExtractedEntitiesByDocId(documentId);
        documentRepository.deleteSearchIndexStatusByDocId(documentId);
        documentRepository.deleteRelationshipEvidenceByDocId(documentId);
        documentRepository.deleteTimelineEventDocumentsByDocId(documentId);
        documentRepository.clearGraphNodeDocRef(documentId);

        documentRepository.delete(document);
    }

    public void savePortfolioLink(String url, Long userId) {
        validateUrl(url);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Optional<PortfolioLink> existingLink = portfolioLinkRepository.findByUserIdAndPlatformName(userId, "PORTFOLIO");
        if (existingLink.isPresent()) {
            PortfolioLink link = existingLink.get();
            link.setUrl(url);
            portfolioLinkRepository.save(link);
        } else {
            PortfolioLink portfolioLink = PortfolioLink.builder()
                    .user(user)
                    .platformName("PORTFOLIO")
                    .url(url)
                    .build();
            portfolioLinkRepository.save(portfolioLink);
        }
    }

    public void saveGithubLink(String url, Long userId) {
        validateUrl(url);
        if (!url.toLowerCase().contains("github.com")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Must be a valid GitHub Repository link (e.g. https://github.com/user/repo)");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Optional<PortfolioLink> existingLink = portfolioLinkRepository.findByUserIdAndPlatformName(userId, "GITHUB");
        if (existingLink.isPresent()) {
            PortfolioLink link = existingLink.get();
            link.setUrl(url);
            portfolioLinkRepository.save(link);
        } else {
            PortfolioLink portfolioLink = PortfolioLink.builder()
                    .user(user)
                    .platformName("GITHUB")
                    .url(url)
                    .build();
            portfolioLinkRepository.save(portfolioLink);
        }
    }

    public DashboardStatsResponse getStats(Long userId) {
        long totalDocs = documentRepository.countByUserId(userId);
        long certs = documentRepository.countByUserIdAndCategoryName(userId, "CERTIFICATE");
        long resume = documentRepository.countByUserIdAndCategoryName(userId, "RESUME");
        long projects = documentRepository.countByUserIdAndCategoryName(userId, "PROJECT_REPORT");
        long internships = documentRepository.countByUserIdAndCategoryName(userId, "INTERNSHIP_LETTER");
        
        long portfolioLinks = portfolioLinkRepository.countByUserIdAndPlatformName(userId, "PORTFOLIO");
        long githubLinks = portfolioLinkRepository.countByUserIdAndPlatformName(userId, "GITHUB");

        return DashboardStatsResponse.builder()
                .totalDocuments(totalDocs)
                .certificatesCount(certs)
                .resumeCount(resume)
                .projectsCount(projects)
                .internshipsCount(internships)
                .portfolioLinksCount(portfolioLinks)
                .githubLinksCount(githubLinks)
                .build();
    }

    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        List<PortfolioLink> links = portfolioLinkRepository.findByUserId(userId);
        List<UserProfileResponse.PortfolioLinkDTO> linkDTOs = links.stream()
                .map(link -> UserProfileResponse.PortfolioLinkDTO.builder()
                        .id(link.getId())
                        .platformName(link.getPlatformName())
                        .url(link.getUrl())
                        .build())
                .collect(Collectors.toList());

        return UserProfileResponse.builder()
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .links(linkDTOs)
                .build();
    }

    private void validateUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "URL cannot be empty");
        }
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "URL must start with http:// or https://");
        }
    }

    private DocumentResponse mapToResponse(Document document) {
        return DocumentResponse.builder()
                .id(document.getId())
                .title(document.getTitle())
                .originalName(document.getOriginalName())
                .fileType(document.getFileType())
                .size(document.getSize())
                .category(document.getCategory() != null ? document.getCategory().getName() : "PENDING_CLASSIFICATION")
                .status(document.getStatus())
                .ocrText(document.getOcrText())
                .uploadedAt(document.getUploadedAt())
                .build();
    }

    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
            String newUsername = request.getUsername().trim();
            if (!user.getUsername().equals(newUsername) && userRepository.existsByUsername(newUsername)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Username is already taken");
            }
            user.setUsername(newUsername);
        }

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            String newEmail = request.getEmail().trim();
            if (!user.getEmail().equals(newEmail) && userRepository.existsByEmail(newEmail)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Email is already in use");
            }
            user.setEmail(newEmail);
        }

        userRepository.save(user);
        return getProfile(userId);
    }
}
