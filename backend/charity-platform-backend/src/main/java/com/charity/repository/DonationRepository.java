// ==================== DONATION REPOSITORY ====================
package com.charity.repository;

import com.charity.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {
    /**
     * Find donations by status
     */
    List<Donation> findByStatus(DonationStatus status);

    /**
     * Find donations by type (CASH, ITEM, SERVICE)
     */
    List<Donation> findByDonationType(DonationType donationType);

    /**
     * Find donations to a specific project
     */
    List<Donation> findByProject(CharityProject project);

    /**
     * Find donations by donor name
     */
    List<Donation> findByDonorName(String donorName);

    /**
     * Find donations by donor ward (Kenya location)
     */
    List<Donation> findByDonorWard(String donorWard);

    /**
     * Find donations to project with specific status
     */
    List<Donation> findByProjectAndStatus(CharityProject project, DonationStatus status);

    /**
     * Calculate total donation amount to a project
     */
    @Query("SELECT SUM(d.amount) FROM Donation d WHERE d.project.id = :projectId AND d.status = 'RECEIVED'")
    Double calculateTotalDonationsForProject(@Param("projectId") Long projectId);

    /**
     * Calculate total donation amount by type
     */
    @Query("SELECT SUM(d.amount) FROM Donation d WHERE d.donationType = :type AND d.status = 'RECEIVED'")
    Double calculateTotalDonationsByType(@Param("type") DonationType type);

    /**
     * Find donations in a date range
     */
    @Query("SELECT d FROM Donation d WHERE d.donatedAt BETWEEN :startDate AND :endDate ORDER BY d.donatedAt DESC")
    List<Donation> findDonationsByDateRange(@Param("startDate") LocalDateTime startDate,
                                            @Param("endDate") LocalDateTime endDate);

    /**
     * Find pending donations (not yet received)
     */
    List<Donation> findByStatusOrderByDonatedAtAsc(DonationStatus status);

    /**
     * Count donations by status
     */
    long countByStatus(DonationStatus status);

    /**
     * Count donations by type
     */
    long countByDonationType(DonationType donationType);
}
