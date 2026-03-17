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
@RequestMapping("/api/v1/donations")
@RequiredArgsConstructor
public class DonationController {

    private final DonationService donationService;
    private final CharityProjectService projectService;

    @PostMapping
    public ResponseEntity<?> recordDonation(@Valid @RequestBody DonationRequest request) {
        CharityProject project = (request.getProjectId() != null)
                ? projectService.getProjectById(request.getProjectId()) : null;
        Donation donation = DonationMapper.toEntity(request, project);
        Donation saved = donationService.recordDonation(donation, request.getProjectId());
        return ResponseEntity.status(HttpStatus.CREATED).body(DonationMapper.toResponse(saved));
    }

    @GetMapping
    public ResponseEntity<List<DonationResponse>> getAllDonations() {
        return ResponseEntity.ok(
                donationService.getAllDonations().stream()
                        .map(DonationMapper::toResponse).collect(Collectors.toList())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDonationById(@PathVariable Long id) {
        return ResponseEntity.ok(DonationMapper.toResponse(donationService.getDonationById(id)));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<DonationResponse>> getDonationsByStatus(@PathVariable DonationStatus status) {
        return ResponseEntity.ok(
                donationService.getDonationsByStatus(status).stream()
                        .map(DonationMapper::toResponse).collect(Collectors.toList())
        );
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<DonationResponse>> getDonationsByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(
                donationService.getDonationsByProject(projectId).stream()
                        .map(DonationMapper::toResponse).collect(Collectors.toList())
        );
    }

    @GetMapping("/project/{projectId}/total")
    public ResponseEntity<Double> getTotalDonationsForProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(donationService.getTotalDonationsForProject(projectId));
    }

    /**
     * FIX #6: Now calls donationService.updateDonation() instead of recordDonation().
     * recordDonation() hardcoded status = PENDING, which silently reset RECEIVED/USED donations.
     * updateDonation() preserves the existing status unless explicitly changed in the request.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDonation(
            @PathVariable Long id,
            @Valid @RequestBody DonationRequest request) {

        Donation existing = donationService.getDonationById(id);
        CharityProject project = (request.getProjectId() != null)
                ? projectService.getProjectById(request.getProjectId())
                : existing.getProject();

        DonationMapper.updateEntity(existing, request, project);
        Donation updated = donationService.updateDonation(id, existing, request.getProjectId());
        return ResponseEntity.ok(DonationMapper.toResponse(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDonation(@PathVariable Long id) {
        donationService.deleteDonation(id);
        return ResponseEntity.ok("Donation deleted successfully");
    }
}
