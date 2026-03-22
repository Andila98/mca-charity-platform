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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class PageContentService {

    @Autowired
    private PageContentRepository contentRepository;

    @Autowired
    private AdminUserRepository adminUserRepository;

    public ContentResponse updateContent(ContentUpdateRequest request, String adminUsername) {
        AdminUser admin = adminUserRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new UnauthorizedException("Admin not found"));

        PageContent content = contentRepository.findByContentKey(request.getContentKey())
                .orElse(new PageContent());

        content.setContentKey(request.getContentKey());
        content.setContentValue(request.getContentValue());
        content.setPageName(request.getPageName() != null ? request.getPageName() : "landing");
        content.setDescription(request.getDescription());
        content.setUpdatedBy(admin);

        PageContent saved = contentRepository.save(content);
        log.info("Content updated: '{}' by {}", request.getContentKey(), adminUsername);
        return ContentResponse.fromEntity(saved);
    }

    /**
     * FIX #10: Failures are now tracked explicitly in a list rather than inferred
     * from (requestCount - successCount), which was fragile when exceptions were
     * swallowed. The caller receives a BatchResult with both lists populated.
     */
    public BatchResult batchUpdateContent(List<ContentUpdateRequest> requests, String adminUsername) {
        AdminUser admin = adminUserRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new UnauthorizedException("Admin not found"));

        List<ContentResponse> successes = new ArrayList<>();
        List<String> failures = new ArrayList<>();

        for (ContentUpdateRequest request : requests) {
            try {
                PageContent content = contentRepository.findByContentKey(request.getContentKey())
                        .orElse(new PageContent());

                content.setContentKey(request.getContentKey());
                content.setContentValue(request.getContentValue());
                content.setPageName(request.getPageName() != null ? request.getPageName() : "landing");
                content.setDescription(request.getDescription());
                content.setUpdatedBy(admin);

                PageContent saved = contentRepository.save(content);
                successes.add(ContentResponse.fromEntity(saved));
                log.debug("Batch update: saved '{}'", request.getContentKey());

            } catch (Exception e) {
                String errorMsg = "Failed to update '" + request.getContentKey() + "': " + e.getMessage();
                failures.add(errorMsg);
                log.error(errorMsg);
            }
        }

        return new BatchResult(successes, failures);
    }

    /**
     * Simple result holder returned from batchUpdateContent.
     * Replaces the fragile arithmetic in the controller.
     */
    public record BatchResult(List<ContentResponse> successes, List<String> failures) {}

    public ContentResponse getContent(String contentKey) {
        PageContent content = contentRepository.findByContentKey(contentKey)
                .orElseThrow(() -> new RuntimeException("Content not found: " + contentKey));
        return ContentResponse.fromEntity(content);
    }

    public List<ContentResponse> getPageContent(String pageName) {
        return contentRepository.findByPageNameOrderByKey(pageName).stream()
                .map(ContentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public Map<String, String> getPageContentAsMap(String pageName) {
        List<PageContent> contents = contentRepository.findByPageName(pageName);
        Map<String, String> contentMap = new HashMap<>();
        contents.forEach(c -> contentMap.put(c.getContentKey(), c.getContentValue()));
        return contentMap;
    }

    public void deleteContent(String contentKey) {
        PageContent content = contentRepository.findByContentKey(contentKey)
                .orElseThrow(() -> new RuntimeException("Content not found: " + contentKey));
        contentRepository.delete(content);
        log.info("Content deleted: '{}'", contentKey);
    }

    public List<ContentResponse> getRecentUpdates() {
        return contentRepository.findRecentUpdates().stream()
                .map(ContentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public long getPageContentCount(String pageName) {
        return contentRepository.countByPageName(pageName);
    }

    public List<ContentResponse> searchContent(String keyword) {
        return contentRepository.searchContent(keyword).stream()
                .map(ContentResponse::fromEntity)
                .collect(Collectors.toList());
    }
}