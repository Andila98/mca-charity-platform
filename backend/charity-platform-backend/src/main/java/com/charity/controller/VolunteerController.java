package com.charity.controller;

import com.charity.dto.request.VolunteerRequest;
import com.charity.dto.response.VolunteerResponse;
import com.charity.entity.Volunteer;
import com.charity.entity.VolunteerStatus;
import com.charity.mapper.VolunteerMapper;
import com.charity.service.VolunteerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/volunteers")
@RequiredArgsConstructor
public class VolunteerController {
    private final VolunteerService volunteerService;

    /**
     * Register a new volunteer
     */
    @PostMapping
    public ResponseEntity<?> registerVolunteer(@Valid @RequestBody VolunteerRequest request) {
        Volunteer volunteer = VolunteerMapper.toEntity(request);
        Volunteer savedVolunteer = volunteerService.registerVolunteer(volunteer);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(VolunteerMapper.toResponse(savedVolunteer));
    }

    /**
     * Get all volunteers
     */
    @GetMapping
    public ResponseEntity<List<VolunteerResponse>> getAllVolunteers() {
        List<Volunteer> volunteers = volunteerService.getAllActiveVolunteers();
        List<VolunteerResponse> response = volunteers.stream()
                .map(VolunteerMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Get volunteer by ID
     */
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
     * Get volunteers by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<VolunteerResponse>> getVolunteersByStatus(@PathVariable("status") VolunteerStatus status) {
        // Now this call will work because we added it to the Service
        List<Volunteer> volunteers = volunteerService.getVolunteersByStatus(status);

        List<VolunteerResponse> response = volunteers.stream()
                .map(VolunteerMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Get volunteers by ward
     */
    @GetMapping("/ward/{ward}")
    public ResponseEntity<List<VolunteerResponse>> getVolunteersByWard(@PathVariable String ward) {
        List<Volunteer> volunteers = volunteerService.getVolunteersByWard(ward);
        List<VolunteerResponse> response = volunteers.stream()
                .map(VolunteerMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
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

    /**
     * Update volunteer
     */
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

    /**
     * Delete volunteer
     */

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVolunteer(@PathVariable Long id) {
        // In your service, you use 'suspendVolunteer' instead of a hard delete
        volunteerService.suspendVolunteer(id);
        return ResponseEntity.ok("Volunteer suspended successfully");
    }
}
