package com.charity.controller;

import com.charity.dto.request.ImageUploadRequest;
import com.charity.dto.response.ImageResponse;
import com.charity.service.ImageManagementService;
import com.charity.config.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/images")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5500",
        "http://localhost:8081",
        "http://127.0.0.1:5500",
        "http://127.0.0.1:3000",
        "file://"
})
public class AdminImageController {

    private final ImageManagementService imageManagementService;
    private final JwtUtil jwtUtil;

    /**
     * Upload image
     * POST /api/admin/images/upload
     * Form data: file, imageKey, pageName, altText, description
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("imageKey") String imageKey,
            @RequestParam("pageName") String pageName,
            @RequestParam(value = "altText", required = false) String altText,
            @RequestParam(value = "description", required = false) String description,
            @RequestHeader("Authorization") String token) {

        try {
            String adminUsername = extractUsernameFromToken(token);

            ImageUploadRequest request = new ImageUploadRequest();
            request.setImageKey(imageKey);
            request.setPageName(pageName);
            request.setAltText(altText);
            request.setDescription(description);

            ImageResponse uploaded = imageManagementService.uploadImage(file, request, adminUsername);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Image uploaded successfully");
            response.put("image", uploaded);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Image upload failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "success", false,
                            "error", "Upload failed",
                            "message", e.getMessage()
                    ));
        }
    }

    /**
     * Get image by key (PUBLIC - no auth)
     * GET /api/admin/images/{imageKey}
     */
    @GetMapping("/{imageKey}")
    public ResponseEntity<?> getImage(@PathVariable String imageKey) {
        try {
            ImageResponse image = imageManagementService.getImage(imageKey);
            return ResponseEntity.ok(image);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get all active images for a page (PUBLIC - no auth)
     * GET /api/admin/images/page/{pageName}
     */
    @GetMapping("/page/{pageName}")
    public ResponseEntity<?> getPageImages(@PathVariable String pageName) {
        try {
            List<ImageResponse> images = imageManagementService.getPageImages(pageName);

            Map<String, Object> response = new HashMap<>();
            response.put("page", pageName);
            response.put("images", images);
            response.put("count", images.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete image
     * DELETE /api/admin/images/{imageKey}
     */
    @DeleteMapping("/{imageKey}")
    public ResponseEntity<?> deleteImage(
            @PathVariable String imageKey,
            @RequestHeader("Authorization") String token) {

        try {
            String adminUsername = extractUsernameFromToken(token);
            imageManagementService.deleteImage(imageKey, adminUsername);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Image deleted successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "success", false,
                            "error", "Delete failed",
                            "message", e.getMessage()
                    ));
        }
    }

    /**
     * Update image metadata
     * PATCH /api/admin/images/{imageKey}
     */
    @PatchMapping("/{imageKey}")
    public ResponseEntity<?> updateImageMetadata(
            @PathVariable String imageKey,
            @RequestParam(required = false) String altText,
            @RequestParam(required = false) String description,
            @RequestHeader("Authorization") String token) {

        try {
            extractUsernameFromToken(token); // Verify auth
            ImageResponse updated = imageManagementService.updateImageMetadata(imageKey, altText, description);

            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Update failed", "message", e.getMessage()));
        }
    }

    /**
     * Get recent uploads
     * GET /api/admin/images/recent/uploads
     */
    @GetMapping("/recent/uploads")
    public ResponseEntity<?> getRecentUploads() {
        try {
            List<ImageResponse> recent = imageManagementService.getRecentUploads();
            return ResponseEntity.ok(recent);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get storage usage stats
     * GET /api/admin/images/stats/storage
     */
    @GetMapping("/stats/storage")
    public ResponseEntity<?> getStorageStats() {
        try {
            long totalSize = imageManagementService.getTotalStorageUsed();
            double sizeInMB = totalSize / (1024.0 * 1024.0);

            return ResponseEntity.ok(Map.of(
                    "totalBytes", totalSize,
                    "totalMB", String.format("%.2f", sizeInMB),
                    "maxAllowedMB", 500
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Extract admin username from JWT token
     * @private
     */
    private String extractUsernameFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }

        String token = authHeader.replace("Bearer ", "");
        return jwtUtil.extractEmail(token);
    }
}
