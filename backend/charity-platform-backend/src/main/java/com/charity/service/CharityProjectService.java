// ==================== CHARITY PROJECT SERVICE ====================
package com.charity.service;

import com.charity.entity.*;
import com.charity.repository.*;
import com.charity.exception.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
@Slf4j
public class CharityProjectService {

    @Autowired
    private CharityProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Create a new charity project
     */
    public CharityProject createProject(CharityProject project, Long createdByUserId) {
        User user = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + createdByUserId));

        project.setCreatedBy(user);
        project.setStatus(ProjectStatus.PLANNED);

        CharityProject savedProject = projectRepository.save(project);
        log.info("New project created: {} (ID: {})", project.getName(), savedProject.getId());
        return savedProject;
    }

    /**
     * Get project by ID
     */
    public CharityProject getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with ID: " + id));
    }

    /**
     * Get all projects
     */
    public List<CharityProject> getAllProjects() {
        return projectRepository.findAll();
    }

    /**
     * Get projects by status
     */
    public List<CharityProject> getProjectsByStatus(ProjectStatus status) {
        return projectRepository.findByStatus(status);
    }

    /**
     * Get projects in a specific ward (Kenya location)
     */
    public List<CharityProject> getProjectsByWard(String ward) {
        return projectRepository.findByWard(ward);
    }

    /**
     * Get projects by category
     */
    public List<CharityProject> getProjectsByCategory(String category) {
        return projectRepository.findByCategory(category);
    }

    /**
     * Get top projects by impact (most beneficiaries)
     */
    public List<CharityProject> getTopProjectsByImpact() {
        return projectRepository.findTopProjectsByImpact();
    }

    /**
     * Get projects created by a specific user
     */
    public List<CharityProject> getProjectsByCreator(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
        return projectRepository.findByCreatedBy(user);
    }

    /**
     * Update project status
     */
    public CharityProject updateProjectStatus(Long projectId, ProjectStatus newStatus) {
        CharityProject project = getProjectById(projectId);
        project.setStatus(newStatus);
        CharityProject updatedProject = projectRepository.save(project);
        log.info("Project status updated: {} -> {} (ID: {})", project.getName(), newStatus, projectId);
        return updatedProject;
    }

    /**
     * Update actual beneficiaries count
     */
    public CharityProject updateBeneficiariesCount(Long projectId, int actualCount) {
        CharityProject project = getProjectById(projectId);
        project.setActualBeneficiaries(actualCount);
        return projectRepository.save(project);
    }

    /**
     * Update project details
     */
    public CharityProject updateProject(Long projectId, CharityProject updatedProject) {
        CharityProject existingProject = getProjectById(projectId);
        existingProject.setName(updatedProject.getName());
        existingProject.setDescription(updatedProject.getDescription());
        existingProject.setCategory(updatedProject.getCategory());
        existingProject.setImpactSummary(updatedProject.getImpactSummary());
        existingProject.setBannerImageUrl(updatedProject.getBannerImageUrl());
        existingProject.setTargetBeneficiaries(updatedProject.getTargetBeneficiaries());
        return projectRepository.save(existingProject);
    }

    /**
     * Count projects by status
     */
    public long countProjectsByStatus(ProjectStatus status) {
        return projectRepository.countByStatus(status);
    }

    /**
     * Delete a project
     */
    public void deleteProject(Long id) {
        CharityProject project = getProjectById(id);
        projectRepository.delete(project);
        log.info("Project deleted: ID {}", id);
    }
}
