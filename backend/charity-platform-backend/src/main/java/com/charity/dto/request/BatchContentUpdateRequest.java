package com.charity.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BatchContentUpdateRequest {
    @NotEmpty(message = "Atleast One Content Item is Required")
    @Valid
    private List<ContentUpdateRequest> contents;

    private String pageName;
}
