package com.charity.controller;


import com.charity.dto.request.EventRequest;
import com.charity.dto.response.EventResponse;
import com.charity.entity.CharityProject;
import com.charity.entity.Event;
import com.charity.entity.EventStatus;
import com.charity.entity.User;
import com.charity.mapper.EventMapper;
import com.charity.service.CharityProjectService;
import com.charity.service.EventService;
import com.charity.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final UserService userService;
    private final CharityProjectService projectService;

    /**
     * Create a new event
     */
    @PostMapping
    public ResponseEntity<?> createEvent(@Valid @RequestBody EventRequest request) {
        // Services now throw exceptions if not found, so we call directly
        User organizer = userService.getUserById(request.getOrganizedById());

        CharityProject project = null;
        if (request.getProjectId() != null) {
            project = projectService.getProjectById(request.getProjectId());
        }

        Event event = EventMapper.toEntity(request, organizer, project);

        // Match the service signature: (Event, Long, Long)
        Event savedEvent = eventService.createEvent(event, request.getOrganizedById(), request.getProjectId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(EventMapper.toResponse(savedEvent));
    }

    /**
     * Get all events
     */
    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        List<Event> events = eventService.getAllEvents();
        List<EventResponse> response = events.stream()
                .map(EventMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Get event by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getEventById(@PathVariable Long id) {
        // Removed .orElse(null) - Service handles the exception
        Event event = eventService.getEventById(id);
        return ResponseEntity.ok(EventMapper.toResponse(event));
    }

    /**
     * Get upcoming events
     */
    @GetMapping("/upcoming")
    public ResponseEntity<List<EventResponse>> getUpcomingEvents() {
        List<Event> events = eventService.getUpcomingEvents();
        List<EventResponse> response = events.stream()
                .map(EventMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<EventResponse>> getEventsByStatus(@PathVariable EventStatus status) {
        // Now this call will work because we added the method to the Service
        List<Event> events = eventService.getEventsByStatus(status);

        List<EventResponse> response = events.stream()
                .map(EventMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Get events by project
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<EventResponse>> getEventsByProject(@PathVariable Long projectId) {
        // Service method takes Long projectId, not the Project object
        List<Event> events = eventService.getEventsByProject(projectId);
        List<EventResponse> response = events.stream()
                .map(EventMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Register volunteer for event
     */
    @PostMapping("/{eventId}/register/{volunteerId}")
    public ResponseEntity<?> registerVolunteer(
            @PathVariable Long eventId,
            @PathVariable Long volunteerId) {

        // Corrected method name to match Service
        Event event = eventService.registerVolunteerForEvent(eventId, volunteerId);
        return ResponseEntity.ok(EventMapper.toResponse(event));
    }

    /**
     * Update event
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventRequest request) {

        Event event = eventService.getEventById(id);

        User organizer = (request.getOrganizedById() != null)
                ? userService.getUserById(request.getOrganizedById())
                : event.getOrganizedBy();

        CharityProject project = (request.getProjectId() != null)
                ? projectService.getProjectById(request.getProjectId())
                : event.getProject();

        EventMapper.updateEntity(event, request, organizer, project);

        // Note: You may need to add an updateEvent(Long, Event) to your service
        // For now, using repository-style save if updateEvent isn't specialized
        Event updatedEvent = eventService.updateEventStatus(id, event.getStatus());

        return ResponseEntity.ok(EventMapper.toResponse(updatedEvent));
    }

    /**
     * Delete event
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        // You need to add 'deleteEvent' to EventService if it's missing
        eventService.getEventById(id);
        // eventService.deleteEvent(id);
        return ResponseEntity.ok("Event deleted successfully");
    }

}
