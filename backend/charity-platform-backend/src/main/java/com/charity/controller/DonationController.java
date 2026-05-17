package com.charity.controller;


import com.charity.dto.request.DonationRequest;
import com.charity.dto.response.DonationResponse;
import com.charity.dto.response.PagedResponse;
import com.charity.entity.CharityProject;
import com.charity.entity.Donation;
import com.charity.entity.DonationStatus;
import com.charity.mapper.DonationMapper;
import com.charity.service.CharityProjectService;
import com.charity.service.DonationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/donations")
@RequiredArgsConstructor
@Tag(name = "Donations", description = "Record and manage donations")
public class DonationController {

    private final DonationService donationService;
    private final CharityProjectService projectService;

    @Operation(summary = "Record a donation")
    @ApiResponse(responseCode = "201", description = "Donation recorded")
    @ApiResponse(responseCode = "400", description = "Validation error")
    @PostMapping
    public ResponseEntity<?> recordDonation(@Valid @RequestBody DonationRequest request) {
        CharityProject project = (request.getProjectId() != null)
                ? projectService.getProjectById(request.getProjectId()) : null;
        Donation donation = DonationMapper.toEntity(request, project);
        Donation saved = donationService.recordDonation(donation, request.getProjectId());
        return ResponseEntity.status(HttpStatus.CREATED).body(DonationMapper.toResponse(saved));
    }

    @Operation(summary = "List all donations (paginated)")
    @ApiResponse(responseCode = "200", description = "Page of donations")
    @GetMapping
    public ResponseEntity<PagedResponse<DonationResponse>> getAllDonations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "donatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Page<DonationResponse> result = donationService.getAllDonations(PageRequest.of(page, size, sort))
                .map(DonationMapper::toResponse);
        return ResponseEntity.ok(PagedResponse.from(result));
    }

    @Operation(summary = "Get donation by ID")
    @ApiResponse(responseCode = "200", description = "Donation found")
    @ApiResponse(responseCode = "404", description = "Donation not found")
    @GetMapping("/{id}")
    public ResponseEntity<?> getDonationById(@PathVariable Long id) {
        return ResponseEntity.ok(DonationMapper.toResponse(donationService.getDonationById(id)));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<PagedResponse<DonationResponse>> getDonationsByStatus(
            @PathVariable DonationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<DonationResponse> result = donationService.getDonationsByStatus(status, PageRequest.of(page, size, Sort.by("donatedAt").descending()))
                .map(DonationMapper::toResponse);
        return ResponseEntity.ok(PagedResponse.from(result));
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

    @Operation(summary = "Update a donation", description = "Preserves existing status unless explicitly changed in the request")
    @ApiResponse(responseCode = "200", description = "Donation updated")
    @ApiResponse(responseCode = "404", description = "Donation not found")
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

    @Operation(summary = "Soft-delete a donation")
    @ApiResponse(responseCode = "200", description = "Donation deleted")
    @ApiResponse(responseCode = "404", description = "Donation not found")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDonation(@PathVariable Long id) {
        donationService.deleteDonation(id);
        return ResponseEntity.ok("Donation deleted successfully");
    }
}
