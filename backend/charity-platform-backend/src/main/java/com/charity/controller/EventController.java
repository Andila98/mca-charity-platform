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

    @PostMapping
    public ResponseEntity<?> createEvent(@Valid @RequestBody EventRequest request) {
        User organizer = userService.getUserById(request.getOrganizedById());
        CharityProject project = (request.getProjectId() != null)
                ? projectService.getProjectById(request.getProjectId()) : null;

        Event event = EventMapper.toEntity(request, organizer, project);
        Event saved = eventService.createEvent(event, request.getOrganizedById(), request.getProjectId());
        return ResponseEntity.status(HttpStatus.CREATED).body(EventMapper.toResponse(saved));
    }

    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        return ResponseEntity.ok(
                eventService.getAllEvents().stream().map(EventMapper::toResponse).collect(Collectors.toList())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(EventMapper.toResponse(eventService.getEventById(id)));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<EventResponse>> getUpcomingEvents() {
        return ResponseEntity.ok(
                eventService.getUpcomingEvents().stream().map(EventMapper::toResponse).collect(Collectors.toList())
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<EventResponse>> getEventsByStatus(@PathVariable EventStatus status) {
        return ResponseEntity.ok(
                eventService.getEventsByStatus(status).stream().map(EventMapper::toResponse).collect(Collectors.toList())
        );
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<EventResponse>> getEventsByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(
                eventService.getEventsByProject(projectId).stream().map(EventMapper::toResponse).collect(Collectors.toList())
        );
    }

    @PostMapping("/{eventId}/register/{volunteerId}")
    public ResponseEntity<?> registerVolunteer(@PathVariable Long eventId, @PathVariable Long volunteerId) {
        return ResponseEntity.ok(EventMapper.toResponse(eventService.registerVolunteerForEvent(eventId, volunteerId)));
    }

    /**
     * FIX #5: Now calls eventService.updateEvent() so ALL fields are persisted.
     * The old code called updateEventStatus() which only saved the status field,
     * silently discarding name, description, location, dates, etc.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventRequest request) {

        Event existing = eventService.getEventById(id);

        User organizer = (request.getOrganizedById() != null)
                ? userService.getUserById(request.getOrganizedById())
                : existing.getOrganizedBy();

        CharityProject project = (request.getProjectId() != null)
                ? projectService.getProjectById(request.getProjectId())
                : existing.getProject();

        EventMapper.updateEntity(existing, request, organizer, project);

        // FIX: use updateEvent(), not updateEventStatus()
        Event updated = eventService.updateEvent(id, existing);
        return ResponseEntity.ok(EventMapper.toResponse(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok("Event deleted successfully");
    }
}
