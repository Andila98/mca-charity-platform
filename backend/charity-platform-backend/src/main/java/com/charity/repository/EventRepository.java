// ==================== EVENT REPOSITORY ====================
package com.charity.repository;

import com.charity.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import  org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    /**
     * Find events by status
     */
    List<Event> findByStatus(EventStatus status);

    /**
     * Find events by location/ward
     */
    List<Event> findByLocation(String location);

    /**
     * Find events organized by a specific user
     */
    List<Event> findByOrganizedBy(User organizedBy);

    /**
     * Find events linked to a specific project
     */
    List<Event> findByProject(CharityProject project);

    /**
     * Find events by status and project
     */
    List<Event> findByStatusAndProject(EventStatus status, CharityProject project);

    /**
     * Find upcoming events (not yet started)
     * Sorted by event date ascending
     */
    @Query("SELECT e FROM Event e WHERE e.eventDate > :now ORDER BY e.eventDate ASC")
    List<Event> findUpcomingEvents(@Param("now") LocalDateTime now);

    /**
     * Find past events (already happened)
     */
    @Query("SELECT e FROM Event e WHERE e.eventDate < :now ORDER BY e.eventDate DESC")
    List<Event> findPastEvents(@Param("now") LocalDateTime now);

    /**
     * Find events in a date range
     */
    @Query("SELECT e FROM Event e WHERE e.eventDate BETWEEN :startDate AND :endDate ORDER BY e.eventDate ASC")
    List<Event> findEventsByDateRange(@Param("startDate") LocalDateTime startDate,
                                      @Param("endDate") LocalDateTime endDate);

    /**
     * Find events with highest attendance
     */
    @Query("SELECT e FROM Event e ORDER BY e.actualAttendees DESC")
    List<Event> findTopEventsByAttendance();

    /**
     * Count events by status
     */
    long countByStatus(EventStatus status);
}
