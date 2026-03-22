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

    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException("Event not found with ID: " + id));
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public List<Event> getUpcomingEvents() {
        return eventRepository.findUpcomingEvents(LocalDateTime.now());
    }

    public List<Event> getPastEvents() {
        return eventRepository.findPastEvents(LocalDateTime.now());
    }

    public List<Event> getEventsByProject(Long projectId) {
        CharityProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with ID: " + projectId));
        return eventRepository.findByProject(project);
    }

    public List<Event> getEventsByOrganizer(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
        return eventRepository.findByOrganizedBy(user);
    }

    public List<Event> getEventsByStatus(EventStatus status) {
        return eventRepository.findByStatus(status);
    }

    /**
     * FIX #5: Proper full update — all fields persisted, not just status.
     * The old code called EventMapper.updateEntity() (which set fields on the
     * local object) but then called updateEventStatus() which only saved the
     * status field, silently discarding every other change.
     */
    public Event updateEvent(Long id, Event updatedData) {
        Event existing = getEventById(id);
        existing.setName(updatedData.getName());
        existing.setDescription(updatedData.getDescription());
        existing.setLocation(updatedData.getLocation());
        existing.setEventDate(updatedData.getEventDate());
        existing.setEventEndTime(updatedData.getEventEndTime());
        existing.setEventImageUrl(updatedData.getEventImageUrl());
        existing.setExpectedAttendees(updatedData.getExpectedAttendees());
        existing.setStatus(updatedData.getStatus());
        if (updatedData.getOrganizedBy() != null) {
            existing.setOrganizedBy(updatedData.getOrganizedBy());
        }
        if (updatedData.getProject() != null) {
            existing.setProject(updatedData.getProject());
        }
        Event saved = eventRepository.save(existing);
        log.info("Event updated: {} (ID: {})", saved.getName(), id);
        return saved;
    }

    public Event updateEventStatus(Long eventId, EventStatus newStatus) {
        Event event = getEventById(eventId);
        event.setStatus(newStatus);
        return eventRepository.save(event);
    }

    public Event registerVolunteerForEvent(Long eventId, Long volunteerId) {
        Event event = getEventById(eventId);
        if (event.getRegisteredVolunteerIds().contains(volunteerId)) {
            throw new AlreadyRegisteredException("Volunteer already registered for this event");
        }
        event.getRegisteredVolunteerIds().add(volunteerId);
        return eventRepository.save(event);
    }

    public Event unregisterVolunteerFromEvent(Long eventId, Long volunteerId) {
        Event event = getEventById(eventId);
        if (!event.getRegisteredVolunteerIds().contains(volunteerId)) {
            throw new VolunteerNotFoundException("Volunteer not registered for this event");
        }
        event.getRegisteredVolunteerIds().remove(volunteerId);
        return eventRepository.save(event);
    }

    public Event updateActualAttendees(Long eventId, int actualCount) {
        Event event = getEventById(eventId);
        event.setActualAttendees(actualCount);
        return eventRepository.save(event);
    }

    public int getRegisteredVolunteerCount(Long eventId) {
        return getEventById(eventId).getRegisteredVolunteerIds().size();
    }

    public void deleteEvent(Long id) {
        eventRepository.delete(getEventById(id));
    }
}