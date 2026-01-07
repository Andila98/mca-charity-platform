package com.mcacampaignplatform.volunteerservices.service;

import com.mcacampaignplatform.volunteerservices.entity.Volunteer;
import com.mcacampaignplatform.volunteerservices.event.VolunteerRegisteredEvent;
import com.mcacampaignplatform.volunteerservices.repository.VolunteerRepository;
import com.mcacampaignplatform.volunteerservices.dto.CreateVolunteerRequest;
import com.mcacampaignplatform.volunteerservices.dto.VolunteerResponse;
import com.mcacampaignplatform.volunteerservices.entity.Status;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class VolunteerService {

    @Autowired
    private VolunteerRepository volunteerRepository;

    @Autowired(required = false)
    private KafkaTemplate<String, VolunteerRegisteredEvent> kafkaTemplate;

    /**
     * Register a new volunteer and publish event to Kafka
     */
    public VolunteerResponse registerVolunteer(CreateVolunteerRequest request) {
        log.info("Registering volunteer: {}", request.getPhone());

        // Check if phone already exists
        if (volunteerRepository.findByPhone(request.getPhone()).isPresent()) {
            throw new RuntimeException("Phone number already registered!");
        }

        // Create volunteer entity
        Volunteer volunteer = Volunteer.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .ward(request.getWard())
                .interest(request.getInterest())
                .status(Status.ACTIVE)
                .build();

        // Save to database
        Volunteer saved = volunteerRepository.save(volunteer);
        log.info("Volunteer registered with ID: {}", saved.getId());

        // Publish event to Kafka (if Kafka is available)
        try {
            publishVolunteerRegisteredEvent(saved);
        } catch (Exception e) {
            log.warn("Failed to publish Kafka event (Kafka may not be running yet): {}", e.getMessage());
            // Don't fail the registration if Kafka is not available
            // In production, you'd want more robust error handling
        }

        return mapToResponse(saved);
    }

    /**
     * Publish volunteer registered event to Kafka
     * This event will be consumed by:
     * - Messaging Service (to send SMS/WhatsApp)
     * - Analytics Service (to track stats)
     */
    private void publishVolunteerRegisteredEvent(Volunteer volunteer) {
        VolunteerRegisteredEvent event = VolunteerRegisteredEvent.builder()
                .volunteerId(volunteer.getId())
                .name(volunteer.getName())
                .phone(volunteer.getPhone())
                .email(volunteer.getEmail())
                .ward(volunteer.getWard())
                .interest(volunteer.getInterest())
                .timestamp(System.currentTimeMillis())
                .eventType("VOLUNTEER_REGISTERED")
                .build();

        if (kafkaTemplate != null) {
            kafkaTemplate.send("volunteer-events", String.valueOf(volunteer.getId()), event);
            log.info("Published VolunteerRegisteredEvent to Kafka for volunteer ID: {}", volunteer.getId());
        }
    }

    /**
     * Get volunteer by ID
     */
    public VolunteerResponse getVolunteerById(Long id) {
        Volunteer volunteer = volunteerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Volunteer not found!"));
        return mapToResponse(volunteer);
    }

    /**
     * Get all volunteers (paginated)
     */
    public Page<VolunteerResponse> getAllVolunteers(Pageable pageable) {
        return volunteerRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    /**
     * Get volunteers by ward
     */
    public List<VolunteerResponse> getVolunteersByWard(String ward) {
        return volunteerRepository.findByWard(ward)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get active volunteers
     */
    public List<VolunteerResponse> getActiveVolunteers() {
        return volunteerRepository.findByStatus(Status.ACTIVE)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get active volunteers in a specific ward
     */
    public List<VolunteerResponse> getActiveVolunteersByWard(String ward) {
        return volunteerRepository.findByStatusAndWard(Status.ACTIVE, ward)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get volunteers (paginated)
     */
    public Page<VolunteerResponse> getActiveVolunteersPaginated(Pageable pageable) {
        return volunteerRepository.findByStatus(Status.ACTIVE, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Update volunteer status
     */
    public VolunteerResponse updateVolunteerStatus(Long id, Status status) {
        Volunteer volunteer = volunteerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Volunteer not found!"));

        volunteer.setStatus(status);
        Volunteer updated = volunteerRepository.save(volunteer);

        log.info("Volunteer {} status updated to {}", id, status);
        return mapToResponse(updated);
    }

    /**
     * Delete volunteer
     */
    public void deleteVolunteer(Long id) {
        if (!volunteerRepository.existsById(id)) {
            throw new RuntimeException("Volunteer not found!");
        }
        volunteerRepository.deleteById(id);
        log.info("Volunteer {} deleted", id);
    }

    /**
     * Get statistics
     */
    public long getTotalActiveVolunteers() {
        return volunteerRepository.countByStatus(Status.ACTIVE);
    }

    public long getVolunteerCountByWard(String ward) {
        return volunteerRepository.countByWard(ward);
    }

    /**
     * Helper method to map Volunteer entity to VolunteerResponse DTO
     */
    private VolunteerResponse mapToResponse(Volunteer volunteer) {
        return VolunteerResponse.builder()
                .id(volunteer.getId())
                .name(volunteer.getName())
                .phone(volunteer.getPhone())
                .email(volunteer.getEmail())
                .ward(volunteer.getWard())
                .interest(volunteer.getInterest())
                .status(volunteer.getStatus().toString())
                .createdAt(volunteer.getCreatedAt())
                .build();
    }
}
