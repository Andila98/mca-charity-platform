package com.charity.dto.response;

import com.charity.entity.ProjectStatus;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {

    private Long id;
    private String name;
    private String description;
    private String ward;
    private ProjectStatus status;
    private String impactSummary;
    private String bannerImageUrl;
    private String category;
    private Integer targetBeneficiaries;
    private Integer actualBeneficiaries;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Long createdById;
    private String createdByName; // User's full name
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
