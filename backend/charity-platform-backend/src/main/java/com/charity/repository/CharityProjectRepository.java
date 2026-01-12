// ==================== CHARITY PROJECT REPOSITORY ====================
package com.charity.repository;

import com.charity.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CharityProjectRepository extends JpaRepository<CharityProject, Long> {
    /**
     * Find projects by status
     */
    List<CharityProject> findByStatus(ProjectStatus status);

    /**
     * Find projects in a specific ward (Kenya location)
     */
    List<CharityProject> findByWard(String ward);

    /**
     * Find projects by category (Education, Healthcare, etc.)
     */
    List<CharityProject> findByCategory(String category);

    /**
     * Find projects created by a specific user
     */
    List<CharityProject> findByCreatedBy(User createdBy);

    /**
     * Find ongoing projects in a ward (useful for filtering)
     */
    List<CharityProject> findByWardAndStatus(String ward, ProjectStatus status);

    /**
     * Find projects by category and status
     */
    List<CharityProject> findByCategoryAndStatus(String category, ProjectStatus status);

    /**
     * Find projects with highest impact (actual beneficiaries)
     */
    @Query("SELECT p FROM CharityProject p ORDER BY p.actualBeneficiaries DESC")
    List<CharityProject> findTopProjectsByImpact();

    /**
     * Find projects created in a date range
     */
    @Query("SELECT p FROM CharityProject p WHERE p.createdAt BETWEEN :startDate AND :endDate")
    List<CharityProject> findProjectsByDateRange(@Param("startDate") LocalDateTime startDate,
                                                 @Param("endDate") LocalDateTime endDate);

    /**
     * Count projects by status
     */
    long countByStatus(ProjectStatus status);
}
