package com.charity.dto.response;


import com.charity.entity.PageContent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ContentResponse {
    private Long id;
    private String contentKey;
    private String contentValue;
    private String pageName;
    private String updatedByUsername;
    private LocalDateTime updatedAt;
    private LocalDateTime createdAt;
    private String description;
    private Integer updateCount;

    /**
     * Convert PageContent entity to response DTO
     */
    public static ContentResponse fromEntity(PageContent content) {
        return ContentResponse.builder()
                .id(content.getId())
                .contentKey(content.getContentKey())
                .contentValue(content.getContentValue())
                .pageName(content.getPageName())
                .updatedByUsername(content.getUpdatedBy().getUsername())
                .updatedAt(content.getUpdatedAt())
                .createdAt(content.getCreatedAt())
                .description(content.getDescription())
                .updateCount(content.getUpdateCount())
                .build();
    }
}
