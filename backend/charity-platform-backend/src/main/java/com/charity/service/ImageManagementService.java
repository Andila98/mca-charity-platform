package com.charity.service;

import com.charity.dto.request.ImageUploadRequest;
import com.charity.dto.response.ImageResponse;
import com.charity.entity.Image;
import com.charity.entity.AdminUser;
import com.charity.exception.UnauthorizedException;
import com.charity.repository.ImageRepository;
import com.charity.repository.AdminUserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class ImageManagementService {

    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private ImageStorageService imageStorageService;

    /**
     * Upload and save image
     */
    public ImageResponse uploadImage(
            MultipartFile file,
            ImageUploadRequest request,
            String adminUsername) {

        // Get admin user
        AdminUser admin = adminUserRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new UnauthorizedException("Admin not found"));

        // Upload file to storage
        ImageStorageService.ImageMetadata metadata = imageStorageService.uploadImage(file, request.getImageKey());

        // Check if image key already exists (update or create)
        Image image = imageRepository.findByImageKey(request.getImageKey())
                .orElse(new Image());

        // Set image details
        image.setImageKey(request.getImageKey());
        image.setImageName(metadata.getOriginalName());
        image.setFileName(metadata.getFileName());
        image.setFileUrl(metadata.getFileUrl());
        image.setFileSize(metadata.getFileSize());
        image.setMimeType(metadata.getMimeType());
        image.setExtension(metadata.getExtension());
        image.setPageName(request.getPageName());
        image.setAltText(request.getAltText());
        image.setDescription(request.getDescription());
        image.setUploadedBy(admin);
        image.setStatus("active");

        // Try to extract image dimensions (optional)
        // In production, use a library like ImageIO or thumbnailator

        Image saved = imageRepository.save(image);
        log.info("Image saved to database: '{}' by {}", request.getImageKey(), adminUsername);

        return ImageResponse.fromEntity(saved);
    }

    /**
     * Get image by key
     */
    public ImageResponse getImage(String imageKey) {
        Image image = imageRepository.findByImageKey(imageKey)
                .orElseThrow(() -> new RuntimeException("Image not found: " + imageKey));

        // Increment download count
        image.setDownloadCount((image.getDownloadCount() != null ? image.getDownloadCount() : 0) + 1);
        imageRepository.save(image);

        return ImageResponse.fromEntity(image);
    }

    /**
     * Get all active images for a page
     */
    public List<ImageResponse> getPageImages(String pageName) {
        return imageRepository.findByPageNameAndStatus(pageName, "active").stream()
                .map(ImageResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get all images for a page (including inactive)
     */
    public List<ImageResponse> getAllPageImages(String pageName) {
        return imageRepository.findByPageName(pageName).stream()
                .map(ImageResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Delete image
     */
    public void deleteImage(String imageKey, String adminUsername) {
        Image image = imageRepository.findByImageKey(imageKey)
                .orElseThrow(() -> new RuntimeException("Image not found: " + imageKey));

        // Delete file from storage
        imageStorageService.deleteImage(image.getFileName());

        // Delete from database
        imageRepository.delete(image);
        log.info("Image deleted: '{}' by {}", imageKey, adminUsername);
    }

    /**
     * Deactivate image (soft delete)
     */
    public ImageResponse deactivateImage(String imageKey) {
        Image image = imageRepository.findByImageKey(imageKey)
                .orElseThrow(() -> new RuntimeException("Image not found: " + imageKey));

        image.setStatus("inactive");
        Image updated = imageRepository.save(image);

        return ImageResponse.fromEntity(updated);
    }

    /**
     * Update image metadata
     */
    public ImageResponse updateImageMetadata(
            String imageKey,
            String altText,
            String description) {

        Image image = imageRepository.findByImageKey(imageKey)
                .orElseThrow(() -> new RuntimeException("Image not found: " + imageKey));

        if (altText != null) image.setAltText(altText);
        if (description != null) image.setDescription(description);

        Image updated = imageRepository.save(image);
        return ImageResponse.fromEntity(updated);
    }

    /**
     * Get recent uploads
     */
    public List<ImageResponse> getRecentUploads() {
        return imageRepository.findRecentUploads().stream()
                .map(ImageResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get total storage usage
     */
    public long getTotalStorageUsed() {
        return imageRepository.getTotalStorageUsed();
    }

    /**
     * Search images
     */
    public List<ImageResponse> searchImages(String keyword) {
        return imageRepository.searchImages(keyword).stream()
                .map(ImageResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get image count for a page
     */
    public long getPageImageCount(String pageName) {
        return imageRepository.countByPageName(pageName);
    }
}
