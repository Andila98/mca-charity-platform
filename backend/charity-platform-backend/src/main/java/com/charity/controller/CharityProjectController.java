package com.charity.controller;

import com.charity.dto.request.ProjectRequest;
import com.charity.dto.response.ProjectResponse;
import com.charity.entity.CharityProject;
import com.charity.entity.ProjectStatus;
import com.charity.mapper.ProjectMapper;
import com.charity.service.CharityProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class CharityProjectController {

    private final CharityProjectService projectService;

    /**
     * FIX #4: Controller no longer fetches User before calling the service.
     * The service owns the User lookup — one DB hit instead of two.
     */
    @PostMapping
    public ResponseEntity<?> createProject(@Valid @RequestBody ProjectRequest request) {
        CharityProject project = ProjectMapper.toEntity(request, null); // creator set inside service
        CharityProject savedProject = projectService.createProject(project, request.getCreatedById());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ProjectMapper.toResponse(savedProject));
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAllProjects() {
        return ResponseEntity.ok(
                projectService.getAllProjects().stream()
                        .map(ProjectMapper::toResponse)
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(ProjectMapper.toResponse(projectService.getProjectById(id)));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ProjectResponse>> getProjectsByStatus(@PathVariable ProjectStatus status) {
        return ResponseEntity.ok(
                projectService.getProjectsByStatus(status).stream()
                        .map(ProjectMapper::toResponse)
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/ward/{ward}")
    public ResponseEntity<List<ProjectResponse>> getProjectsByWard(@PathVariable String ward) {
        return ResponseEntity.ok(
                projectService.getProjectsByWard(ward).stream()
                        .map(ProjectMapper::toResponse)
                        .collect(Collectors.toList())
        );
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

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok("Project deleted successfully");
    }
}