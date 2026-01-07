package com.mcacampaignplatform.volunteerservices.controller;

import com.mcacampaignplatform.volunteerservices.entity.Volunteer;
import com.mcacampaignplatform.volunteerservices.service.VolunteerService;
import com.mcacampaignplatform.volunteerservices.dto.CreateVolunteerRequest;
import com.mcacampaignplatform.volunteerservices.dto.VolunteerResponse;
import com.mcacampaignplatform.volunteerservices.entity.Status;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/volunteers")
@CrossOrigin(origins = "*")
@Slf4j
public class VolunteerController {

    @Autowired
    private VolunteerService volunteerService;

    /**
     * Health check endpoint
     * URL: GET http://localhost:8003/api/volunteers/health
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("✅ Volunteer Service is running on port 8003");
    }

    /**
     * Register new volunteer
     * URL: POST http://localhost:8003/api/volunteers
     * Body: {
     *   "name": "John Doe",
     *   "phone": "0712345678",
     *   "email": "john@example.com",
     *   "ward": "Westlands",
     *   "interest": "Community mobilization"
     * }
     */
    @PostMapping
    public ResponseEntity<?> registerVolunteer(@RequestBody CreateVolunteerRequest request) {
        try {
            log.info("Registering volunteer: {}", request.getPhone());
            VolunteerResponse response = volunteerService.registerVolunteer(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Registration failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Registration failed: " + e.getMessage());
        }
    }

    /**
     * Get volunteer by ID
     * URL: GET http://localhost:8003/api/volunteers/1
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getVolunteer(@PathVariable Long id) {
        try {
            VolunteerResponse response = volunteerService.getVolunteerById(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Volunteer not found: " + e.getMessage());
        }
    }

    /**
     * Get all volunteers (paginated)
     * URL: GET http://localhost:8003/api/volunteers?page=0&size=10
     */
    @GetMapping
    public ResponseEntity<?> getAllVolunteers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<VolunteerResponse> response = volunteerService.getAllVolunteers(pageable);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error fetching volunteers: " + e.getMessage());
        }
    }

    /**
     * Get active volunteers
     * URL: GET http://localhost:8003/api/volunteers/active
     */
    @GetMapping("/active")
    public ResponseEntity<?> getActiveVolunteers() {
        try {
            List<VolunteerResponse> response = volunteerService.getActiveVolunteers();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error fetching active volunteers: " + e.getMessage());
        }
    }

    /**
     * Get volunteers by ward
     * URL: GET http://localhost:8003/api/volunteers/ward/Westlands
     */
    @GetMapping("/ward/{ward}")
    public ResponseEntity<?> getVolunteersByWard(@PathVariable String ward) {
        try {
            List<VolunteerResponse> response = volunteerService.getVolunteersByWard(ward);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error fetching volunteers: " + e.getMessage());
        }
    }

    /**
     * Get active volunteers by ward
     * URL: GET http://localhost:8003/api/volunteers/active/ward/Westlands
     */
    @GetMapping("/active/ward/{ward}")
    public ResponseEntity<?> getActiveVolunteersByWard(@PathVariable String ward) {
        try {
            List<VolunteerResponse> response = volunteerService.getActiveVolunteersByWard(ward);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error fetching volunteers: " + e.getMessage());
        }
    }

    /**
     * Update volunteer status
     * URL: PUT http://localhost:8003/api/volunteers/1/status?status=INACTIVE
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam Status status) {
        try {
            VolunteerResponse response = volunteerService.updateVolunteerStatus(id, status);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error updating status: " + e.getMessage());
        }
    }

    /**
     * Delete volunteer
     * URL: DELETE http://localhost:8003/api/volunteers/1
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVolunteer(@PathVariable Long id) {
        try {
            volunteerService.deleteVolunteer(id);
            return ResponseEntity.ok("Volunteer deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error deleting volunteer: " + e.getMessage());
        }
    }

    /**
     * Get statistics - total active volunteers
     * URL: GET http://localhost:8003/api/volunteers/stats/active-count
     */
    @GetMapping("/stats/active-count")
    public ResponseEntity<?> getActiveCount() {
        try {
            long count = volunteerService.getTotalActiveVolunteers();
            return ResponseEntity.ok("Total active volunteers: " + count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error fetching stats: " + e.getMessage());
        }
    }

    /**
     * Get statistics - volunteers by ward
     * URL: GET http://localhost:8003/api/volunteers/stats/ward/Westlands
     */
    @GetMapping("/stats/ward/{ward}")
    public ResponseEntity<?> getWardCount(@PathVariable String ward) {
        try {
            long count = volunteerService.getVolunteerCountByWard(ward);
            return ResponseEntity.ok("Volunteers in " + ward + ": " + count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error fetching stats: " + e.getMessage());
        }
    }
}

