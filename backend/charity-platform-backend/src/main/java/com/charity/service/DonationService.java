// ==================== DONATION SERVICE ====================
package com.charity.service;

import com.charity.entity.*;
import com.charity.repository.*;
import com.charity.exception.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    public Donation recordDonation(Donation donation, Long projectId) {
        if (projectId != null) {
            CharityProject project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new ProjectNotFoundException("Project not found with ID: " + projectId));
            donation.setProject(project);
        }
        donation.setStatus(DonationStatus.PENDING);
        Donation saved = donationRepository.save(donation);
        log.info("Donation recorded: {} from {} (ID: {})", donation.getAmount(), donation.getDonorName(), saved.getId());
        return saved;
    }

    /**
     * FIX #6: Dedicated update method that preserves the existing status.
     * The old code reused recordDonation() for updates, which hardcoded
     * status = PENDING — resetting a RECEIVED or USED donation silently.
     */
    public Donation updateDonation(Long donationId, Donation updatedData, Long projectId) {
        Donation existing = getDonationById(donationId);

        existing.setAmount(updatedData.getAmount());
        existing.setDonorName(updatedData.getDonorName());
        existing.setDonorEmail(updatedData.getDonorEmail());
        existing.setDonorPhone(updatedData.getDonorPhone());
        existing.setDonorWard(updatedData.getDonorWard());
        existing.setDonationType(updatedData.getDonationType());
        existing.setItemDescription(updatedData.getItemDescription());
        existing.setNotes(updatedData.getNotes());

        // Only update status if explicitly provided in the request
        if (updatedData.getStatus() != null) {
            existing.setStatus(updatedData.getStatus());
        }

        // Update project link if a new projectId was supplied
        if (projectId != null) {
            CharityProject project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new ProjectNotFoundException("Project not found with ID: " + projectId));
            existing.setProject(project);
        }

        Donation saved = donationRepository.save(existing);
        log.info("Donation updated: ID {}", donationId);
        return saved;
    }

    public Donation getDonationById(Long id) {
        return donationRepository.findById(id)
                .orElseThrow(() -> new DonationNotFoundException("Donation not found with ID: " + id));
    }

    public List<Donation> getAllDonations() {
        return donationRepository.findAll();
    }

    public Page<Donation> getAllDonations(Pageable pageable) {
        return donationRepository.findAll(pageable);
    }

    public List<Donation> getDonationsByStatus(DonationStatus status) {
        return donationRepository.findByStatus(status);
    }

    public Page<Donation> getDonationsByStatus(DonationStatus status, Pageable pageable) {
        return donationRepository.findByStatus(status, pageable);
    }

    public List<Donation> getPendingDonations() {
        return donationRepository.findByStatusOrderByDonatedAtAsc(DonationStatus.PENDING);
    }

    public List<Donation> getDonationsByType(DonationType type) {
        return donationRepository.findByDonationType(type);
    }

    public List<Donation> getDonationsByProject(Long projectId) {
        CharityProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with ID: " + projectId));
        return donationRepository.findByProject(project);
    }

    public Donation markAsReceived(Long donationId) {
        Donation donation = getDonationById(donationId);
        donation.setStatus(DonationStatus.RECEIVED);
        donation.setReceivedAt(LocalDateTime.now());
        return donationRepository.save(donation);
    }

    public Donation markAsUsed(Long donationId) {
        Donation donation = getDonationById(donationId);
        donation.setStatus(DonationStatus.USED);
        return donationRepository.save(donation);
    }

    public Double getTotalDonationsForProject(Long projectId) {
        projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with ID: " + projectId));
        Double total = donationRepository.calculateTotalDonationsForProject(projectId);
        return total != null ? total : 0.0;
    }

    public Double getTotalDonationsByType(DonationType type) {
        Double total = donationRepository.calculateTotalDonationsByType(type);
        return total != null ? total : 0.0;
    }

    public long countDonationsByStatus(DonationStatus status) {
        return donationRepository.countByStatus(status);
    }

    public List<Donation> getDonationsByDonorWard(String ward) {
        return donationRepository.findByDonorWard(ward);
    }

    public void deleteDonation(Long id) {
        Donation donation = getDonationById(id);
        donation.setDeleted(true);
        donation.setDeletedAt(java.time.LocalDateTime.now());
        donationRepository.save(donation);
        log.info("Donation soft-deleted: ID {}", id);
    }
}