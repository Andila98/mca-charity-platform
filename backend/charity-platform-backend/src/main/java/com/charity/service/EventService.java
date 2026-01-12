// ==================== EVENT SERVICE ====================
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

@Service
@Transactional
@Slf4j
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private CharityProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Create a new event
     */
    public Event createEvent(Event event, Long organizedByUserId, Long projectId) {
        User user = userRepository.findById(organizedByUserId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + organizedByUserId));

        event.setOrganizedBy(user);
        event.setStatus(EventStatus.PLANNED);

        if (projectId != null) {
            CharityProject project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new ProjectNotFoundException("Project not found with ID: " + projectId));
            event.setProject(project);
        }

        Event savedEvent = eventRepository.save(event);
        log.info("New event created: {} (ID: {})", event.getName(), savedEvent.getId());
        return savedEvent;
    }

    /**
     * Get event by ID
     */
    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException("Event not found with ID: " + id));
    }

    /**
     * Get all events
     */
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    /**
     * Get upcoming events (not yet started)
     */
    public List<Event> getUpcomingEvents() {
        return eventRepository.findUpcomingEvents(LocalDateTime.now());
    }

    /**
     * Get past events (already happened)
     */
    public List<Event> getPastEvents() {
        return eventRepository.findPastEvents(LocalDateTime.now());
    }

    /**
     * Get events by project
     */
    public List<Event> getEventsByProject(Long projectId) {
        CharityProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with ID: " + projectId));
        return eventRepository.findByProject(project);
    }

    /**
     * Get events organized by a user
     */
    public List<Event> getEventsByOrganizer(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
        return eventRepository.findByOrganizedBy(user);
    }

    /**
     * Register volunteer for event
     */
    public Event registerVolunteerForEvent(Long eventId, Long volunteerId) {
        Event event = getEventById(eventId);

        if (event.getRegisteredVolunteerIds().contains(volunteerId)) {
            throw new AlreadyRegisteredException("Volunteer already registered for this event");
        }

        event.getRegisteredVolunteerIds().add(volunteerId);
        Event updatedEvent = eventRepository.save(event);
        log.info("Volunteer {} registered for event {}", volunteerId, eventId);
        return updatedEvent;
    }

    /**
     * Unregister volunteer from event
     */
    public Event unregisterVolunteerFromEvent(Long eventId, Long volunteerId) {
        Event event = getEventById(eventId);

        if (!event.getRegisteredVolunteerIds().contains(volunteerId)) {
            throw new VolunteerNotFoundException("Volunteer not registered for this event");
        }

        event.getRegisteredVolunteerIds().remove(volunteerId);
        Event updatedEvent = eventRepository.save(event);
        log.info("Volunteer {} unregistered from event {}", volunteerId, eventId);
        return updatedEvent;
    }

    /**
     * Update event status
     */
    public Event updateEventStatus(Long eventId, EventStatus newStatus) {
        Event event = getEventById(eventId);
        event.setStatus(newStatus);
        Event updatedEvent = eventRepository.save(event);
        log.info("Event status updated: {} -> {} (ID: {})", event.getName(), newStatus, eventId);
        return updatedEvent;
    }

    /**
     * Update actual attendance
     */
    public Event updateActualAttendees(Long eventId, int actualCount) {
        Event event = getEventById(eventId);
        event.setActualAttendees(actualCount);
        return eventRepository.save(event);
    }

    /**
     * Get count of registered volunteers
     */
    public int getRegisteredVolunteerCount(Long eventId) {
        Event event = getEventById(eventId);
        return event.getRegisteredVolunteerIds().size();
    }
}
