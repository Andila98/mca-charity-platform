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


// ==================== VOLUNTEER SERVICE ====================
@Service
@Transactional
@Slf4j
public class VolunteerService {

    @Autowired
    private VolunteerRepository volunteerRepository;

    /**
     * Register a new volunteer
     */
    public Volunteer registerVolunteer(Volunteer volunteer) {
        if (volunteerRepository.existsByEmail(volunteer.getEmail())) {
            throw new VolunteerAlreadyExistsException("Email already registered: " + volunteer.getEmail());
        }

        volunteer.setStatus(VolunteerStatus.ACTIVE);
        Volunteer savedVolunteer = volunteerRepository.save(volunteer);
        log.info("New volunteer registered: {} (ID: {})", volunteer.getEmail(), savedVolunteer.getId());
        return savedVolunteer;
    }

    /**
     * Get volunteer by ID
     */
    public Volunteer getVolunteerById(Long id) {
        return volunteerRepository.findById(id)
                .orElseThrow(() -> new VolunteerNotFoundException("Volunteer not found with ID: " + id));
    }

    /**
     * Get volunteers by their current status (ACTIVE, SUSPENDED, etc.)
     */
    public List<Volunteer> getVolunteersByStatus(VolunteerStatus status) {
        return volunteerRepository.findByStatus(status);
    }

    /**
     * Get all active volunteers
     */
    public List<Volunteer> getAllActiveVolunteers() {
        return volunteerRepository.findByStatusOrderByLastActiveAtDesc(VolunteerStatus.ACTIVE);
    }

    /**
     * Get volunteers by interest area
     */
    public List<Volunteer> getVolunteersByInterest(String interest) {
        return volunteerRepository.findByInterest(interest);
    }

    /**
     * Get volunteers in a specific ward
     */
    public List<Volunteer> getVolunteersByWard(String ward) {
        return volunteerRepository.findByWard(ward);
    }

    /**
     * Get recently registered volunteers (last 7 days)
     */
    public List<Volunteer> getRecentVolunteers(int days) {
        LocalDateTime pastDate = LocalDateTime.now().minusDays(days);
        return volunteerRepository.findRecentVolunteers(pastDate);
    }

    /**
     * Update volunteer profile
     */
    public Volunteer updateVolunteer(Long volunteerId, Volunteer updatedVolunteer) {
        Volunteer existingVolunteer = getVolunteerById(volunteerId);
        existingVolunteer.setName(updatedVolunteer.getName());
        existingVolunteer.setPhone(updatedVolunteer.getPhone());
        existingVolunteer.setWard(updatedVolunteer.getWard());
        existingVolunteer.setInterests(updatedVolunteer.getInterests());
        existingVolunteer.setBio(updatedVolunteer.getBio());
        existingVolunteer.setProfileImageUrl(updatedVolunteer.getProfileImageUrl());
        return volunteerRepository.save(existingVolunteer);
    }

    /**
     * Suspend a volunteer (admin action)
     */
    public Volunteer suspendVolunteer(Long volunteerId) {
        Volunteer volunteer = getVolunteerById(volunteerId);
        volunteer.setStatus(VolunteerStatus.SUSPENDED);
        Volunteer suspendedVolunteer = volunteerRepository.save(volunteer);
        log.info("Volunteer suspended: {} (ID: {})", volunteer.getEmail(), volunteerId);
        return suspendedVolunteer;
    }

    /**
     * Reactivate a volunteer
     */
    public Volunteer reactivateVolunteer(Long volunteerId) {
        Volunteer volunteer = getVolunteerById(volunteerId);
        volunteer.setStatus(VolunteerStatus.ACTIVE);
        Volunteer reactivatedVolunteer = volunteerRepository.save(volunteer);
        log.info("Volunteer reactivated: {} (ID: {})", volunteer.getEmail(), volunteerId);
        return reactivatedVolunteer;
    }

    /**
     * Update last active timestamp
     */
    public void updateLastActive(Long volunteerId) {
        Volunteer volunteer = getVolunteerById(volunteerId);
        volunteer.setLastActiveAt(LocalDateTime.now());
        volunteerRepository.save(volunteer);
    }
}
