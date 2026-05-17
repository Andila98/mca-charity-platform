package com.charity.controller;

import com.charity.dto.request.VolunteerRequest;
import com.charity.dto.response.PagedResponse;
import com.charity.dto.response.VolunteerResponse;
import com.charity.entity.Volunteer;
import com.charity.entity.VolunteerStatus;
import com.charity.mapper.VolunteerMapper;
import com.charity.service.VolunteerService;
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
@RequestMapping("/api/v1/volunteers")
@RequiredArgsConstructor
@Tag(name = "Volunteers", description = "Register and manage volunteers")
public class VolunteerController {
    private final VolunteerService volunteerService;

    @Operation(summary = "Register a new volunteer")
    @ApiResponse(responseCode = "201", description = "Volunteer registered")
    @ApiResponse(responseCode = "400", description = "Validation error or email already registered")
    @PostMapping
    public ResponseEntity<?> registerVolunteer(@Valid @RequestBody VolunteerRequest request) {
        Volunteer volunteer = VolunteerMapper.toEntity(request);
        Volunteer savedVolunteer = volunteerService.registerVolunteer(volunteer);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(VolunteerMapper.toResponse(savedVolunteer));
    }

    @Operation(summary = "List all volunteers (paginated)")
    @ApiResponse(responseCode = "200", description = "Page of volunteers")
    @GetMapping
    public ResponseEntity<PagedResponse<VolunteerResponse>> getAllVolunteers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "registeredAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Page<VolunteerResponse> result = volunteerService.getAllVolunteers(PageRequest.of(page, size, sort))
                .map(VolunteerMapper::toResponse);
        return ResponseEntity.ok(PagedResponse.from(result));
    }

    @Operation(summary = "Get volunteer by ID")
    @ApiResponse(responseCode = "200", description = "Volunteer found")
    @ApiResponse(responseCode = "404", description = "Volunteer not found")
    @GetMapping("/{id}")
    public ResponseEntity<?> getVolunteerById(@PathVariable Long id) {
        /**
        Volunteer volunteer = volunteerService.getVolunteerById(id)
                .orElse(null);

        if (volunteer == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(VolunteerMapper.toResponse(volunteer));
        */
        // No .orElse(null) needed because Service throws exception if not found
        Volunteer volunteer = volunteerService.getVolunteerById(id);
        return ResponseEntity.ok(VolunteerMapper.toResponse(volunteer));
    }

    /**
     * Get volunteers by status (paginated)
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<PagedResponse<VolunteerResponse>> getVolunteersByStatus(
            @PathVariable("status") VolunteerStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<VolunteerResponse> result = volunteerService.getVolunteersByStatus(status, PageRequest.of(page, size, Sort.by("registeredAt").descending()))
                .map(VolunteerMapper::toResponse);
        return ResponseEntity.ok(PagedResponse.from(result));
    }

    /**
     * Get volunteers by ward (paginated)
     */
    @GetMapping("/ward/{ward}")
    public ResponseEntity<PagedResponse<VolunteerResponse>> getVolunteersByWard(
            @PathVariable String ward,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<VolunteerResponse> result = volunteerService.getVolunteersByWard(ward, PageRequest.of(page, size, Sort.by("registeredAt").descending()))
                .map(VolunteerMapper::toResponse);
        return ResponseEntity.ok(PagedResponse.from(result));
    }

    /**
     * Get volunteers by interest
     */
    @GetMapping("/interest/{interest}")
    public ResponseEntity<List<VolunteerResponse>> getVolunteersByInterest(@PathVariable String interest) {
        List<Volunteer> volunteers = volunteerService.getVolunteersByInterest(interest);
        List<VolunteerResponse> response = volunteers.stream()
                .map(VolunteerMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Update a volunteer")
    @ApiResponse(responseCode = "200", description = "Volunteer updated")
    @ApiResponse(responseCode = "404", description = "Volunteer not found")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateVolunteer(
            @PathVariable Long id,
            @Valid @RequestBody VolunteerRequest request) {

        /**
        Volunteer volunteer = volunteerService.getVolunteerById(id)
                .orElse(null);

        if (volunteer == null) {
            return ResponseEntity.notFound().build();
        }

        VolunteerMapper.updateEntity(volunteer, request);
        Volunteer updatedVolunteer = volunteerService.updateVolunteer(volunteer);

        return ResponseEntity.ok(VolunteerMapper.toResponse(updatedVolunteer));
        */
        // 1. Get existing entity
        Volunteer volunteer = volunteerService.getVolunteerById(id);

        // 2. Map updates from request to the entity
        VolunteerMapper.updateEntity(volunteer, request);

        // 3. Call service (Note: service requires ID and Object)
        Volunteer updatedVolunteer = volunteerService.updateVolunteer(id, volunteer);

        return ResponseEntity.ok(VolunteerMapper.toResponse(updatedVolunteer));
    }

    @Operation(summary = "Suspend a volunteer")
    @ApiResponse(responseCode = "200", description = "Volunteer suspended")
    @ApiResponse(responseCode = "404", description = "Volunteer not found")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVolunteer(@PathVariable Long id) {
        // In your service, you use 'suspendVolunteer' instead of a hard delete
        volunteerService.suspendVolunteer(id);
        return ResponseEntity.ok("Volunteer suspended successfully");
    }
}
