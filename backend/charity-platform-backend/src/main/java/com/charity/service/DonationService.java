// ==================== DONATION SERVICE ====================
package com.charity.service;

import com.charity.entity.*;
import com.charity.repository.*;
import com.charity.exception.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;


@Service
@Transactional
@Slf4j
public class DonationService {

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private CharityProjectRepository projectRepository;

    /**
     * Record a new donation
     */
    public Donation recordDonation(Donation donation, Long projectId) {
        if (projectId != null) {
            CharityProject project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new ProjectNotFoundException("Project not found with ID: " + projectId));
            donation.setProject(project);
        }

        donation.setStatus(DonationStatus.PENDING);
        Donation savedDonation = donationRepository.save(donation);
        log.info("Donation recorded: {} from {} (ID: {})", donation.getAmount(), donation.getDonorName(), savedDonation.getId());
        return savedDonation;
    }

    /**
     * Get donation by ID
     */
    public Donation getDonationById(Long id) {
        return donationRepository.findById(id)
                .orElseThrow(() -> new DonationNotFoundException("Donation not found with ID: " + id));
    }

    /**
     * Get all donations
     */
    public List<Donation> getAllDonations() {
        return donationRepository.findAll();
    }

    /**
     * Get donations by status
     */
    public List<Donation> getDonationsByStatus(DonationStatus status) {
        return donationRepository.findByStatus(status);
    }

    /**
     * Get pending donations (oldest first)
     */
    public List<Donation> getPendingDonations() {
        return donationRepository.findByStatusOrderByDonatedAtAsc(DonationStatus.PENDING);
    }

    /**
     * Get donations by type (CASH, ITEM, SERVICE)
     */
    public List<Donation> getDonationsByType(DonationType type) {
        return donationRepository.findByDonationType(type);
    }

    /**
     * Get donations to a specific project
     */
    public List<Donation> getDonationsByProject(Long projectId) {
        CharityProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with ID: " + projectId));
        return donationRepository.findByProject(project);
    }

    /**
     * Mark donation as received
     */
    public Donation markAsReceived(Long donationId) {
        Donation donation = getDonationById(donationId);
        donation.setStatus(DonationStatus.RECEIVED);
        donation.setReceivedAt(LocalDateTime.now());
        Donation updatedDonation = donationRepository.save(donation);
        log.info("Donation marked as received: {} (ID: {})", donation.getAmount(), donationId);
        return updatedDonation;
    }

    /**
     * Mark donation as used
     */
    public Donation markAsUsed(Long donationId) {
        Donation donation = getDonationById(donationId);
        donation.setStatus(DonationStatus.USED);
        Donation updatedDonation = donationRepository.save(donation);
        log.info("Donation marked as used: {} (ID: {})", donation.getAmount(), donationId);
        return updatedDonation;
    }

    /**
     * Calculate total donations for a project
     */
    public Double getTotalDonationsForProject(Long projectId) {
        projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException("..."));

        Double total = donationRepository.calculateTotalDonationsForProject(projectId);
        return total != null ? total : 0.0;
    }



    /**
     * Calculate total donations by type
     */
    public Double getTotalDonationsByType(DonationType type) {
        Double total = donationRepository.calculateTotalDonationsByType(type);
        return total != null ? total : 0.0;
    }

    /**
     * Count donations by status
     */
    public long countDonationsByStatus(DonationStatus status) {
        return donationRepository.countByStatus(status);
    }

    /**
     * Get donations by donor ward (Kenya location)
     */
    public List<Donation> getDonationsByDonorWard(String ward) {
        return donationRepository.findByDonorWard(ward);
    }

    /**
     * Delete a donation record
     */
    public void deleteDonation(Long id) {
        Donation donation = getDonationById(id);
        donationRepository.delete(donation);
        log.info("Donation record deleted: ID {}", id);
    }
}
