package com.charity.dto.request;


import com.charity.entity.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ProjectRequest {

    @NotBlank(message = "Project name is required")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Ward is required")
    private String ward;

    private ProjectStatus status;
    private String impactSummary;
    private String bannerImageUrl;
    private String category;

    @NotNull(message = "Target beneficiaries is required")
    private Integer targetBeneficiaries;

    private Integer actualBeneficiaries = 0;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @NotNull(message = "Creator ID is required")
    private Long createdById; // User ID who creates the project
}
