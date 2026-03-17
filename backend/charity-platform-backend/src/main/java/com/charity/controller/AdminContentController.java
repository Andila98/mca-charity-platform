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
@RequestMapping("/api/v1/admin/content")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:3000", "http://localhost:5500",
        "http://localhost:8081", "http://127.0.0.1:5500",
        "http://127.0.0.1:3000", "file://"
})
public class AdminContentController {

    private final PageContentService contentService;
    private final JwtUtil jwtUtil;

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
     * FIX #10: Controller now uses BatchResult which explicitly tracks failures
     * instead of computing failureCount = total - success (fragile arithmetic).
     */
    @PostMapping("/batch-update")
    public ResponseEntity<?> batchUpdateContent(
            @Valid @RequestBody BatchContentUpdateRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            String adminUsername = extractUsernameFromToken(token);
            PageContentService.BatchResult result =
                    contentService.batchUpdateContent(request.getContents(), adminUsername);

            return ResponseEntity.ok(BatchContentUpdateResponse.builder()
                    .message("Batch update completed")
                    .successCount(result.successes().size())
                    .failureCount(result.failures().size())
                    .updatedContent(result.successes())
                    .errors(result.failures())
                    .build());

        } catch (Exception e) {
            log.error("Batch update failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse("Batch update failed", e.getMessage()));
        }
    }

    @GetMapping("/{contentKey}")
    public ResponseEntity<?> getContent(@PathVariable String contentKey) {
        try {
            return ResponseEntity.ok(contentService.getContent(contentKey));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/page/{pageName}")
    public ResponseEntity<?> getPageContent(@PathVariable String pageName) {
        try {
            List<ContentResponse> content = contentService.getPageContent(pageName);
            Map<String, Object> response = new HashMap<>();
            response.put("page", pageName);
            response.put("content", content);
            response.put("count", content.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error retrieving content", e.getMessage()));
        }
    }

    @GetMapping("/page-map/{pageName}")
    public ResponseEntity<?> getPageContentMap(@PathVariable String pageName) {
        try {
            return ResponseEntity.ok(contentService.getPageContentAsMap(pageName));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error retrieving content map", e.getMessage()));
        }
    }

    @DeleteMapping("/{contentKey}")
    public ResponseEntity<?> deleteContent(
            @PathVariable String contentKey,
            @RequestHeader("Authorization") String token) {
        try {
            extractUsernameFromToken(token);
            contentService.deleteContent(contentKey);
            return ResponseEntity.ok(new SuccessResponse("Content deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse("Delete failed", e.getMessage()));
        }
    }

    @GetMapping("/recent/updates")
    public ResponseEntity<?> getRecentUpdates() {
        try {
            return ResponseEntity.ok(contentService.getRecentUpdates());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private String extractUsernameFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }
        return jwtUtil.extractEmail(authHeader.replace("Bearer ", ""));
    }
}
