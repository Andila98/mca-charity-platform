package com.charity.dto.request;


import com.charity.entity.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Null;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProjectRequest {

    // Validation groups
    public interface Create {}
    public interface Update {}

    @NotBlank(groups = Create.class, message = "Project name is required")
    @Null(groups = Update.class)
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Ward is required")
    private String ward;

    private ProjectStatus status;
    private String impactSummary;
    private String bannerImageUrl;
    private String category;

    @NotNull(groups = Create.class, message = "Target beneficiaries is required")
    private Integer targetBeneficiaries;

    private Integer actualBeneficiaries = 0;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @NotNull(groups = Create.class, message = "Creator ID is required")
    private Long createdById; // User ID who creates the project
}
