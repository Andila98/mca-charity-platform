package com.charity.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "images", indexes = {
        @Index(name = "idx_image_key", columnList = "image_key"),
        @Index(name = "idx_page_name", columnList = "page_name"),
        @Index(name = "idx_uploaded_by", columnList = "uploaded_by_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Image key is required")
    @Column(unique = true, length = 255)
    private String imageKey; // e.g., "hero-image", "about-banner", "impact-1"

    @NotBlank(message = "Image name is required")
    @Column(length = 255)
    private String imageName; // Original filename: "hero-background.jpg"

    @NotBlank(message = "File name is required")
    @Column(length = 255)
    private String fileName; // Stored filename: "img_1706010000_hero.jpg"

    @Column(columnDefinition = "LONGTEXT")
    private String fileUrl; // Full URL: "http://cdn.example.com/images/img_1706010000_hero.jpg"

    @NotNull(message = "File size is required")
    private Long fileSize; // In bytes

    @NotBlank(message = "MIME type is required")
    @Column(length = 50)
    private String mimeType; // "image/jpeg", "image/png", etc.

    @Column(length = 50)
    private String extension; // "jpg", "png", "gif", etc.

    @NotBlank(message = "Page name is required")
    @Column(length = 100)
    private String pageName; // "landing", "about", "impact", etc.

    @Column(length = 500)
    private String altText; // For accessibility: "Hero image showing medical staff"

    @Column(length = 500)
    private String description; // What this image is for

    private Integer width; // Image width in pixels
    private Integer height; // Image height in pixels

    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'active'")
    private String status; // "active", "inactive", "archived"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by_id", nullable = false)
    private AdminUser uploadedBy;

    private LocalDateTime uploadedAt;
    private LocalDateTime updatedAt;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer downloadCount; // Track usage

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        status = "active";
        downloadCount = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}