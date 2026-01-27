package com.charity.controller;

import com.charity.config.JwtUtil;
import com.charity.dto.request.BatchContentUpdateRequest;
import com.charity.dto.request.ContentUpdateRequest;
import com.charity.dto.response.BatchContentUpdateResponse;
import com.charity.dto.response.ContentResponse;
import com.charity.dto.response.ErrorResponse;
import com.charity.dto.response.SuccessResponse;
import com.charity.service.PageContentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/content")
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
public class AdminContentController {


    private final PageContentService contentService;
    private final JwtUtil jwtUtil;

    /**
     * Update single content item
     * POST /api/admin/content/update
     */
    @PostMapping("/update")
    public ResponseEntity<?> updateContent(
            @Valid @RequestBody ContentUpdateRequest request,
            @RequestHeader("Authorization") String token) {

        try {
            String adminUsername = extractUsernameFromToken(token);
            ContentResponse updated = contentService.updateContent(request, adminUsername);

            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("Content update failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse("Update failed", e.getMessage()));
        }
    }

    /**
     * Batch update multiple content items
     * POST /api/admin/content/batch-update
     */
    @PostMapping("/batch-update")
    public ResponseEntity<?> batchUpdateContent(
            @Valid @RequestBody BatchContentUpdateRequest request,
            @RequestHeader("Authorization") String token) {

        try {
            String adminUsername = extractUsernameFromToken(token);
            List<ContentResponse> updated = contentService.batchUpdateContent(
                    request.getContents(),
                    adminUsername
            );

            return ResponseEntity.ok(BatchContentUpdateResponse.builder()
                    .message("Batch update completed successfully")
                    .successCount(updated.size())
                    .failureCount(request.getContents().size() - updated.size())
                    .updatedContent(updated)
                    .build());

        } catch (Exception e) {
            log.error("Batch update failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse("Batch update failed", e.getMessage()));
        }
    }

    /**
     * Get single content item (PUBLIC - no auth required)
     * GET /api/admin/content/{contentKey}
     */
    @GetMapping("/{contentKey}")
    public ResponseEntity<?> getContent(@PathVariable String contentKey) {
        try {
            ContentResponse content = contentService.getContent(contentKey);
            return ResponseEntity.ok(content);
        } catch (Exception e) {
            log.warn("Content not found: {}", contentKey);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get all content for a page (PUBLIC - no auth required)
     * GET /api/admin/content/page/{pageName}
     */
    @GetMapping("/page/{pageName}")
    public ResponseEntity<?> getPageContent(@PathVariable String pageName) {
        try {
            List<ContentResponse> content = contentService.getPageContent(pageName);

            // Return as map for easier frontend use
            Map<String, Object> response = new HashMap<>();
            response.put("page", pageName);
            response.put("content", content);
            response.put("count", content.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error retrieving page content: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error retrieving content", e.getMessage()));
        }
    }

    /**
     * Get page content as simple key-value map (PUBLIC - no auth required)
     * GET /api/admin/content/page-map/{pageName}
     */
    @GetMapping("/page-map/{pageName}")
    public ResponseEntity<?> getPageContentMap(@PathVariable String pageName) {
        try {
            Map<String, String> contentMap = contentService.getPageContentAsMap(pageName);
            return ResponseEntity.ok(contentMap);
        } catch (Exception e) {
            log.error("Error retrieving content map: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error retrieving content map", e.getMessage()));
        }
    }

    /**
     * Delete content item
     * DELETE /api/admin/content/{contentKey}
     */
    @DeleteMapping("/{contentKey}")
    public ResponseEntity<?> deleteContent(
            @PathVariable String contentKey,
            @RequestHeader("Authorization") String token) {

        try {
            extractUsernameFromToken(token); // Verify auth
            contentService.deleteContent(contentKey);

            return ResponseEntity.ok(new SuccessResponse("Content deleted successfully"));
        } catch (Exception e) {
            log.error("Delete failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse("Delete failed", e.getMessage()));
        }
    }

    /**
     * Get recent updates across all pages
     * GET /api/admin/content/recent/updates
     */
    @GetMapping("/recent/updates")
    public ResponseEntity<?> getRecentUpdates() {
        try {
            List<ContentResponse> recent = contentService.getRecentUpdates();
            return ResponseEntity.ok(recent);
        } catch (Exception e) {
            log.error("Error retrieving recent updates: {}", e.getMessage());
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
