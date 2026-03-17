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
     * FIX #4: Service is now the single owner of the User lookup.
     * The controller no longer pre-fetches the User — it only passes the ID.
     * This removes the redundant second DB hit that was happening before.
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

    public CharityProject getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with ID: " + id));
    }

    public List<CharityProject> getAllProjects() {
        return projectRepository.findAll();
    }

    public List<CharityProject> getProjectsByStatus(ProjectStatus status) {
        return projectRepository.findByStatus(status);
    }

    public List<CharityProject> getProjectsByWard(String ward) {
        return projectRepository.findByWard(ward);
    }

    public List<CharityProject> getProjectsByCategory(String category) {
        return projectRepository.findByCategory(category);
    }

    public List<CharityProject> getTopProjectsByImpact() {
        return projectRepository.findTopProjectsByImpact();
    }

    public List<CharityProject> getProjectsByCreator(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
        return projectRepository.findByCreatedBy(user);
    }

    public CharityProject updateProjectStatus(Long projectId, ProjectStatus newStatus) {
        CharityProject project = getProjectById(projectId);
        project.setStatus(newStatus);
        return projectRepository.save(project);
    }

    public CharityProject updateBeneficiariesCount(Long projectId, int actualCount) {
        CharityProject project = getProjectById(projectId);
        project.setActualBeneficiaries(actualCount);
        return projectRepository.save(project);
    }

    public CharityProject updateProject(Long projectId, CharityProject updatedProject) {
        CharityProject existing = getProjectById(projectId);
        existing.setName(updatedProject.getName());
        existing.setDescription(updatedProject.getDescription());
        existing.setCategory(updatedProject.getCategory());
        existing.setImpactSummary(updatedProject.getImpactSummary());
        existing.setBannerImageUrl(updatedProject.getBannerImageUrl());
        existing.setTargetBeneficiaries(updatedProject.getTargetBeneficiaries());
        return projectRepository.save(existing);
    }

    public long countProjectsByStatus(ProjectStatus status) {
        return projectRepository.countByStatus(status);
    }

    public void deleteProject(Long id) {
        CharityProject project = getProjectById(id);
        projectRepository.delete(project);
        log.info("Project deleted: ID {}", id);
    }
}
