package com.mcacampaignplatform.volunteerservices.repository;

import com.mcacampaignplatform.volunteerservices.entity.Status;
import com.mcacampaignplatform.volunteerservices.entity.Volunteer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VolunteerRepository extends JpaRepository<Volunteer, Long> {

    // Find by phone (for duplicate checking)
    Optional<Volunteer> findByPhone(String phone);

    // Find by email
    Optional<Volunteer> findByEmail(String email);

    // Find all in a ward
    List<Volunteer> findByWard(String ward);

    // Find by status
    List<Volunteer> findByStatus(Status status);

    // Find active volunteers in a ward
    List<Volunteer> findByStatusAndWard(Status status, String ward);

    // Find with pagination
    Page<Volunteer> findByStatus(Status status, Pageable pageable);

    // Count by status
    long countByStatus(Status status);

    // Count by ward
    long countByWard(String ward);

    // Find by user ID
    Optional<Volunteer> findByUserId(Long userId);

}

