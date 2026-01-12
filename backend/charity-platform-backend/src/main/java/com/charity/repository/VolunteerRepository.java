// ==================== VOLUNTEER REPOSITORY ====================
package com.charity.repository;

import com.charity.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VolunteerRepository extends JpaRepository<Volunteer, Long> {
    /**
     * Find volunteer by email
     */
    Optional<Volunteer> findByEmail(String email);

    /**
     * Find all active volunteers
     */
    List<Volunteer> findByStatus(VolunteerStatus status);

    /**
     * Find all active volunteers (shortcut method)
     */
    List<Volunteer> findByStatusOrderByLastActiveAtDesc(VolunteerStatus status);

    /**
     * Find volunteers in a specific ward
     */
    List<Volunteer> findByWard(String ward);

    /**
     * Find volunteers by interest area
     * Custom query to search for interests in the collection
     */
    @Query("SELECT v FROM Volunteer v JOIN v.interests i WHERE i = :interest")
    List<Volunteer> findByInterest(@Param("interest") String interest);

    /**
     * Find recent volunteers (registered in last N days)
     */
    @Query("SELECT v FROM Volunteer v WHERE v.registeredAt >= :date")
    List<Volunteer> findRecentVolunteers(@Param("date") LocalDateTime date);

    /**
     * Check if volunteer exists by email
     */
    boolean existsByEmail(String email);
}
