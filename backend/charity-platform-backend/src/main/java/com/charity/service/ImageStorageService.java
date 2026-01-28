package com.charity.service;

import com.charity.exception.CharityException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class ImageStorageService {

    @Value("${upload.dir:uploads/images}")
    private String uploadDir;

    @Value("${upload.url-base:http://localhost:8080/uploads/images}")
    private String uploadUrlBase;

    private static final List<String> ALLOWED_EXTENSIONS = new ArrayList<>() {{
        add("jpg");
        add("jpeg");
        add("png");
        add("gif");
        add("webp");
    }};

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    private static final List<String> ALLOWED_MIME_TYPES = new ArrayList<>() {{
        add("image/jpeg");
        add("image/png");
        add("image/gif");
        add("image/webp");
    }};

    /**
     * Upload image file
     * @param file - MultipartFile from frontend
     * @param imageKey - Unique key for this image
     * @return Metadata about uploaded file
     */
    public ImageMetadata uploadImage(MultipartFile file, String imageKey) {

        // Validation
        if (file == null || file.isEmpty()) {
            throw new CharityException("File is empty");
        }

        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new CharityException("File size exceeds maximum of 5MB");
        }

        // Get extension
        String originalName = file.getOriginalFilename();
        String extension = getFileExtension(originalName);

        // Validate extension
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new CharityException("File type not allowed. Allowed: jpg, jpeg, png, gif, webp");
        }

        // Validate MIME type
        String mimeType = file.getContentType();
        if (!ALLOWED_MIME_TYPES.contains(mimeType)) {
            throw new CharityException("Invalid file MIME type: " + mimeType);
        }

        try {
            // Generate unique filename
            String fileName = generateFileName(imageKey, extension);

            // Create upload directory if not exists
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);

            // Save file
            Path filePath = uploadPath.resolve(fileName);
            Files.write(filePath, file.getBytes());

            log.info("Image uploaded: {} -> {}", imageKey, fileName);

            // Return metadata
            return ImageMetadata.builder()
                    .fileName(fileName)
                    .originalName(originalName)
                    .fileSize(file.getSize())
                    .mimeType(mimeType)
                    .extension(extension)
                    .fileUrl(uploadUrlBase + "/" + fileName)
                    .build();

        } catch (IOException e) {
            log.error("Error uploading file: {}", e.getMessage());
            throw new CharityException("Error uploading file: " + e.getMessage());
        }
    }

    /**
     * Delete image file
     */
    public void deleteImage(String fileName) {
        try {
            Path filePath = Paths.get(uploadDir, fileName);
            Files.deleteIfExists(filePath);
            log.info("Image deleted: {}", fileName);
        } catch (IOException e) {
            log.warn("Error deleting file {}: {}", fileName, e.getMessage());
        }
    }

    /**
     * Generate unique filename
     * @private
     */
    private String generateFileName(String imageKey, String extension) {
        long timestamp = Instant.now().getEpochSecond();
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        return String.format("img_%d_%s_%s.%s", timestamp, imageKey, uuid, extension);
    }

    /**
     * Get file extension
     * @private
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            throw new CharityException("Invalid file name");
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }

    /**
     * Image metadata builder helper class
     */
    @lombok.Builder
    @lombok.Data
    public static class ImageMetadata {
        private String fileName;
        private String originalName;
        private Long fileSize;
        private String mimeType;
        private String extension;
        private String fileUrl;
    }
}
