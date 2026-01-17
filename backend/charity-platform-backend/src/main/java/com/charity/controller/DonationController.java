package com.charity.controller;


import com.charity.dto.request.DonationRequest;
import com.charity.dto.response.DonationResponse;
import com.charity.entity.CharityProject;
import com.charity.entity.Donation;
import com.charity.entity.DonationStatus;
import com.charity.mapper.DonationMapper;
import com.charity.service.CharityProjectService;
import com.charity.service.DonationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
public class DonationController {

    private final DonationService donationService;
    private final CharityProjectService projectService;

    /**
     * Record a new donation
     */
    @PostMapping
    public ResponseEntity<?> recordDonation(@Valid @RequestBody DonationRequest request) {
        // Resolve project if specified (Service handles existence check)
        CharityProject project = null;
        if (request.getProjectId() != null) {
            project = projectService.getProjectById(request.getProjectId());
        }

        Donation donation = DonationMapper.toEntity(request, project);
        // Corrected: Passing both entity and projectId to match Service signature
        Donation savedDonation = donationService.recordDonation(donation, request.getProjectId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(DonationMapper.toResponse(savedDonation));
    }

    /**
     * Get all donations
     */
    @GetMapping
    public ResponseEntity<List<DonationResponse>> getAllDonations() {
        List<Donation> donations = donationService.getAllDonations();
        List<DonationResponse> response = donations.stream()
                .map(DonationMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Get donation by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getDonationById(@PathVariable Long id) {
        // Service throws exception if null, no need for .orElse(null)
        Donation donation = donationService.getDonationById(id);
        return ResponseEntity.ok(DonationMapper.toResponse(donation));
    }

    /**
     * Get donations by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<DonationResponse>> getDonationsByStatus(@PathVariable DonationStatus status) {
        List<Donation> donations = donationService.getDonationsByStatus(status);
        List<DonationResponse> response = donations.stream()
                .map(DonationMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Get donations by project
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<DonationResponse>> getDonationsByProject(@PathVariable Long projectId) {
        // Service takes Long ID directly, avoiding redundant Project fetch
        List<Donation> donations = donationService.getDonationsByProject(projectId);
        List<DonationResponse> response = donations.stream()
                .map(DonationMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Get total donations for a project
     */
    @GetMapping("/project/{projectId}/total")
    public ResponseEntity<Double> getTotalDonationsForProject(@PathVariable Long projectId) {
        // 1. You don't need to fetch the project here.
        // The Service method already checks if the project exists.
        Double total = donationService.getTotalDonationsForProject(projectId);

        // 2. Return the total (Service ensures it's at least 0.0)
        return ResponseEntity.ok(total);
    }

    /**
     * Update donation
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDonation(
            @PathVariable Long id,
            @Valid @RequestBody DonationRequest request) {

        Donation donation = donationService.getDonationById(id);

        CharityProject project = (request.getProjectId() != null)
                ? projectService.getProjectById(request.getProjectId())
                : donation.getProject();

        DonationMapper.updateEntity(donation, request, project);

        // Note: You may need a generic update method in Service
        // For now, recordDonation acts similarly to save
        Donation updatedDonation = donationService.recordDonation(donation, request.getProjectId());

        return ResponseEntity.ok(DonationMapper.toResponse(updatedDonation));
    }

    /**
     * Delete donation
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDonation(@PathVariable Long id) {
        // First check existence (Service throws exception if missing)
        donationService.getDonationById(id);

        donationService.deleteDonation(id);
        return ResponseEntity.ok("Donation deleted successfully");
    }
}
