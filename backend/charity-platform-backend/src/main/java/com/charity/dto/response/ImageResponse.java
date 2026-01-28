package com.charity.dto.response;

import com.charity.entity.Image;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageResponse {

    private Long id;
    private String imageKey;
    private String imageName;
    private String fileUrl;
    private Long fileSize;
    private String mimeType;
    private String extension;
    private String pageName;
    private String altText;
    private String description;
    private Integer width;
    private Integer height;
    private String status;
    private String uploadedByUsername;
    private LocalDateTime uploadedAt;
    private LocalDateTime updatedAt;
    private Integer downloadCount;

    /**
     * Convert Image entity to response DTO
     */
    public static ImageResponse fromEntity(Image image) {
        return ImageResponse.builder()
                .id(image.getId())
                .imageKey(image.getImageKey())
                .imageName(image.getImageName())
                .fileUrl(image.getFileUrl())
                .fileSize(image.getFileSize())
                .mimeType(image.getMimeType())
                .extension(image.getExtension())
                .pageName(image.getPageName())
                .altText(image.getAltText())
                .description(image.getDescription())
                .width(image.getWidth())
                .height(image.getHeight())
                .status(image.getStatus())
                .uploadedByUsername(image.getUploadedBy().getUsername())
                .uploadedAt(image.getUploadedAt())
                .updatedAt(image.getUpdatedAt())
                .downloadCount(image.getDownloadCount())
                .build();
    }
}

