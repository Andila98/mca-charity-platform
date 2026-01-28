package com.charity.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContentUpdateRequest {
    @NotBlank(message = "Content Key required")
    private String contentKey;

    @NotBlank( message = "Content Value is Required")
    private String contentValue;

    private String pageName;

    private String description;
}
