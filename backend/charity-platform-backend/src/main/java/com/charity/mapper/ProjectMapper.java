package com.charity.mapper;


import com.charity.dto.request.ProjectRequest;
import com.charity.dto.response.ProjectResponse;
import com.charity.entity.CharityProject;
import com.charity.entity.User;

public class ProjectMapper {

    public static ProjectResponse toResponse(CharityProject project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .ward(project.getWard())
                .status(project.getStatus())
                .impactSummary(project.getImpactSummary())
                .bannerImageUrl(project.getBannerImageUrl())
                .category(project.getCategory())
                .targetBeneficiaries(project.getTargetBeneficiaries())
                .actualBeneficiaries(project.getActualBeneficiaries())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .createdById(project.getCreatedBy().getId())
                .createdByName(project.getCreatedBy().getFullName())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    public static CharityProject toEntity(ProjectRequest request, User creator) {
        CharityProject project = new CharityProject();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setWard(request.getWard());
        project.setStatus(request.getStatus());
        project.setImpactSummary(request.getImpactSummary());
        project.setBannerImageUrl(request.getBannerImageUrl());
        project.setCategory(request.getCategory());
        project.setTargetBeneficiaries(request.getTargetBeneficiaries());
        project.setActualBeneficiaries(request.getActualBeneficiaries());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setCreatedBy(creator);
        return project;
    }

    public static void updateEntity(CharityProject project, ProjectRequest request, User creator) {
        if (request.getName() != null) project.setName(request.getName());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getWard() != null) project.setWard(request.getWard());
        if (request.getStatus() != null) project.setStatus(request.getStatus());
        if (request.getImpactSummary() != null) project.setImpactSummary(request.getImpactSummary());
        if (request.getBannerImageUrl() != null) project.setBannerImageUrl(request.getBannerImageUrl());
        if (request.getCategory() != null) project.setCategory(request.getCategory());
        if (request.getTargetBeneficiaries() != null) project.setTargetBeneficiaries(request.getTargetBeneficiaries());
        if (request.getActualBeneficiaries() != null) project.setActualBeneficiaries(request.getActualBeneficiaries());
        if (request.getStartDate() != null) project.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) project.setEndDate(request.getEndDate());
        if (creator != null) project.setCreatedBy(creator);
    }
}
