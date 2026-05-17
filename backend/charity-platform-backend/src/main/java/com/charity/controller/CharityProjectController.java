package com.charity.controller;

import com.charity.dto.request.ProjectRequest;
import com.charity.dto.response.PagedResponse;
import com.charity.dto.response.ProjectResponse;
import com.charity.entity.CharityProject;
import com.charity.entity.ProjectStatus;
import com.charity.mapper.ProjectMapper;
import com.charity.service.CharityProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@Tag(name = "Charity Projects", description = "Create and manage charity projects")
public class CharityProjectController {

    private final CharityProjectService projectService;

    @Operation(summary = "Create a charity project")
    @ApiResponse(responseCode = "201", description = "Project created")
    @ApiResponse(responseCode = "400", description = "Validation error")
    @ApiResponse(responseCode = "404", description = "Creator user not found")
    @PostMapping
    public ResponseEntity<?> createProject(@Valid @RequestBody ProjectRequest request) {
        CharityProject project = ProjectMapper.toEntity(request, null); // creator set inside service
        CharityProject savedProject = projectService.createProject(project, request.getCreatedById());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ProjectMapper.toResponse(savedProject));
    }

    @Operation(summary = "List all projects (paginated)")
    @ApiResponse(responseCode = "200", description = "Page of projects")
    @GetMapping
    public ResponseEntity<PagedResponse<ProjectResponse>> getAllProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ProjectResponse> result = projectService.getAllProjects(pageable).map(ProjectMapper::toResponse);
        return ResponseEntity.ok(PagedResponse.from(result));
    }

    @Operation(summary = "Get project by ID")
    @ApiResponse(responseCode = "200", description = "Project found")
    @ApiResponse(responseCode = "404", description = "Project not found")
    @GetMapping("/{id}")
    public ResponseEntity<?> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(ProjectMapper.toResponse(projectService.getProjectById(id)));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<PagedResponse<ProjectResponse>> getProjectsByStatus(
            @PathVariable ProjectStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Page<ProjectResponse> result = projectService.getProjectsByStatus(status, PageRequest.of(page, size, sort))
                .map(ProjectMapper::toResponse);
        return ResponseEntity.ok(PagedResponse.from(result));
    }

    @GetMapping("/ward/{ward}")
    public ResponseEntity<PagedResponse<ProjectResponse>> getProjectsByWard(
            @PathVariable String ward,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<ProjectResponse> result = projectService.getProjectsByWard(ward, PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(ProjectMapper::toResponse);
        return ResponseEntity.ok(PagedResponse.from(result));
    }

    @GetMapping("/creator/{userId}")
    public ResponseEntity<List<ProjectResponse>> getProjectsByCreator(@PathVariable Long userId) {
        return ResponseEntity.ok(
                projectService.getProjectsByCreator(userId).stream()
                        .map(ProjectMapper::toResponse)
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/top-impact")
    public ResponseEntity<List<ProjectResponse>> getTopProjectsByImpact() {
        return ResponseEntity.ok(
                projectService.getTopProjectsByImpact().stream()
                        .map(ProjectMapper::toResponse)
                        .collect(Collectors.toList())
        );
    }

    @Operation(summary = "Update a project")
    @ApiResponse(responseCode = "200", description = "Project updated")
    @ApiResponse(responseCode = "404", description = "Project not found")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest request) {

        CharityProject existing = projectService.getProjectById(id);
        // creator stays as-is unless explicitly provided
        ProjectMapper.updateEntity(existing, request, null);
        CharityProject updated = projectService.updateProject(id, existing);
        return ResponseEntity.ok(ProjectMapper.toResponse(updated));
    }

    @Operation(summary = "Soft-delete a project")
    @ApiResponse(responseCode = "200", description = "Project deleted")
    @ApiResponse(responseCode = "404", description = "Project not found")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok("Project deleted successfully");
    }
}