package com.charity.service;

import com.charity.dto.request.ContentUpdateRequest;
import com.charity.dto.response.ContentResponse;
import com.charity.entity.AdminUser;
import com.charity.entity.PageContent;
import com.charity.exception.UnauthorizedException;
import com.charity.repository.AdminUserRepository;
import com.charity.repository.PageContentRepository;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class PageContentService {

    @Autowired
    private PageContentRepository contentRepository;

    @Autowired
    private AdminUserRepository adminUserRepository;

    /**
     * Update or create a single content item
     */
    public ContentResponse updateContent(ContentUpdateRequest request, String adminUsername) {

        // Step 1: Get admin user
        AdminUser admin = adminUserRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new UnauthorizedException("Admin not found"));

        // Step 2: Check if content already exists
        PageContent content = contentRepository.findByContentKey(request.getContentKey())
                .orElse(new PageContent());

        // Step 3: Update fields
        content.setContentKey(request.getContentKey());
        content.setContentValue(request.getContentValue());
        content.setPageName(request.getPageName() != null ? request.getPageName() : "landing");
        content.setDescription(request.getDescription());
        content.setUpdatedBy(admin);

        // Step 4: Save to database
        PageContent saved = contentRepository.save(content);
        log.info("Content updated: '{}' by {}", request.getContentKey(), adminUsername);

        // Step 5: Return response
        return ContentResponse.fromEntity(saved);
    }

    /**
     * Update multiple content items in batch
     */
    public List<ContentResponse> batchUpdateContent(
            List<ContentUpdateRequest> requests,
            String adminUsername) {

        // Get admin user
        AdminUser admin = adminUserRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new UnauthorizedException("Admin not found"));

        // Process each request
        return requests.stream()
                .map(request -> {
                    try {
                        PageContent content = contentRepository.findByContentKey(request.getContentKey())
                                .orElse(new PageContent());

                        content.setContentKey(request.getContentKey());
                        content.setContentValue(request.getContentValue());
                        content.setPageName(request.getPageName() != null ? request.getPageName() : "landing");
                        content.setDescription(request.getDescription());
                        content.setUpdatedBy(admin);

                        PageContent saved = contentRepository.save(content);
                        log.debug("Batch update: saved '{}'", request.getContentKey());

                        return saved;
                    } catch (Exception e) {
                        log.error("Error updating content '{}': {}", request.getContentKey(), e.getMessage());
                        return null;
                    }
                })
                .filter(content -> content != null)
                .map(ContentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get single content by key
     */
    public ContentResponse getContent(String contentKey) {
        PageContent content = contentRepository.findByContentKey(contentKey)
                .orElseThrow(() -> new RuntimeException("Content not found: " + contentKey));

        return ContentResponse.fromEntity(content);
    }

    /**
     * Get all content for a page
     */
    public List<ContentResponse> getPageContent(String pageName) {
        List<PageContent> contents = contentRepository.findByPageNameOrderByKey(pageName);

        return contents.stream()
                .map(ContentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get all content as a map (for easier frontend use)
     */
    public java.util.Map<String, String> getPageContentAsMap(String pageName) {
        List<PageContent> contents = contentRepository.findByPageName(pageName);

        java.util.Map<String, String> contentMap = new java.util.HashMap<>();
        contents.forEach(content ->
                contentMap.put(content.getContentKey(), content.getContentValue())
        );

        return contentMap;
    }

    /**
     * Delete content by key
     */
    public void deleteContent(String contentKey) {
        PageContent content = contentRepository.findByContentKey(contentKey)
                .orElseThrow(() -> new RuntimeException("Content not found: " + contentKey));

        contentRepository.delete(content);
        log.info("Content deleted: '{}'", contentKey);
    }

    /**
     * Get recent updates across all pages
     */
    public List<ContentResponse> getRecentUpdates() {
        return contentRepository.findRecentUpdates().stream()
                .map(ContentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get update history for a specific page
     */
    public List<ContentResponse> getPageUpdateHistory(String pageName) {
        return contentRepository.findByPageNameOrderByKey(pageName).stream()
                .map(ContentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get count of content items for a page
     */
    public long getPageContentCount(String pageName) {
        return contentRepository.countByPageName(pageName);
    }

    /**
     * Search content by keyword
     */
    public List<ContentResponse> searchContent(String keyword) {
        return contentRepository.searchContent(keyword).stream()
                .map(ContentResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
