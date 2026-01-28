package com.charity.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImageUploadRequest {

    @NotBlank(message = "Image key is required")
    private String imageKey; // "hero-image", "about-banner", etc.

    @NotBlank(message = "Page name is required")
    private String pageName; // "landing", "about", etc.

    private String altText; // Accessibility text

    private String description; // What this image is for
}
