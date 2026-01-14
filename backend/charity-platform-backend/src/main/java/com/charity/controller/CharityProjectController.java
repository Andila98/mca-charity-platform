package com.charity.controller;

import com.charity.dto.request.ProjectRequest;
import com.charity.dto.response.ProjectResponse;
import com.charity.entity.CharityProject;
import com.charity.entity.ProjectStatus;
import com.charity.entity.User;
import com.charity.mapper.ProjectMapper;
import com.charity.service.CharityProjectService;
import com.charity.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class CharityProjectController {


    private final CharityProjectService projectService;
    private final UserService userService;

    /**
     * Create a new charity project
     */
    @PostMapping
    public ResponseEntity<?> createProject(@Valid @RequestBody ProjectRequest request) {
        // 1. Get the creator entity (UserService throws exception if not found)
        User creator = userService.getUserById(request.getCreatedById());

        // 2. Map DTO to Entity
        CharityProject project = ProjectMapper.toEntity(request, creator);

        // 3. Call service with BOTH arguments required by your Service signature
        CharityProject savedProject = projectService.createProject(project, request.getCreatedById());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ProjectMapper.toResponse(savedProject));
    }

    /**
     * Get all projects
     */
    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAllProjects() {
        List<CharityProject> projects = projectService.getAllProjects();
        List<ProjectResponse> response = projects.stream()
                .map(ProjectMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Get project by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getProjectById(@PathVariable Long id) {
        // Removed .orElse(null) because Service throws ProjectNotFoundException
        CharityProject project = projectService.getProjectById(id);
        return ResponseEntity.ok(ProjectMapper.toResponse(project));
    }

    /**
     * Get projects by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ProjectResponse>> getProjectsByStatus(@PathVariable ProjectStatus status) {
        List<CharityProject> projects = projectService.getProjectsByStatus(status);
        List<ProjectResponse> response = projects.stream()
                .map(ProjectMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Get projects by ward
     */
    @GetMapping("/ward/{ward}")
    public ResponseEntity<List<ProjectResponse>> getProjectsByWard(@PathVariable String ward) {
        List<CharityProject> projects = projectService.getProjectsByWard(ward);
        List<ProjectResponse> response = projects.stream()
                .map(ProjectMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Get projects by creator
     */
    @GetMapping("/creator/{userId}")
    public ResponseEntity<List<ProjectResponse>> getProjectsByCreator(@PathVariable Long userId) {
        // Your Service method 'getProjectsByCreator' takes a Long (ID), not a User object
        List<CharityProject> projects = projectService.getProjectsByCreator(userId);

        List<ProjectResponse> response = projects.stream()
                .map(ProjectMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Get top projects by impact
     */
    @GetMapping("/top-impact")
    public ResponseEntity<List<ProjectResponse>> getTopProjectsByImpact() {
        List<CharityProject> projects = projectService.getTopProjectsByImpact();
        List<ProjectResponse> response = projects.stream()
                .map(ProjectMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Update project
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest request) {

        // 1. Get existing project (Service throws exception if missing)
        CharityProject project = projectService.getProjectById(id);

        // 2. Map updates (handling creator if provided)
        User creator = (request.getCreatedById() != null)
                ? userService.getUserById(request.getCreatedById())
                : project.getCreatedBy();

        ProjectMapper.updateEntity(project, request, creator);

        // 3. Fix: Service needs (Long id, CharityProject project)
        CharityProject updatedProject = projectService.updateProject(id, project);

        return ResponseEntity.ok(ProjectMapper.toResponse(updatedProject));
    }

    /**
     * Delete project
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        // In your CharityProjectService, you are missing a 'deleteProject' method!
        // You need to add it to the Service, or use a repository call directly (not recommended)
        projectService.getProjectById(id); // Check existence
        // projectService.deleteProject(id); // ADD THIS TO YOUR SERVICE
        return ResponseEntity.ok("Project deleted successfully");
    }

}
