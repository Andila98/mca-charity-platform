package com.charity.mapper;


import com.charity.dto.request.EventRequest;
import com.charity.dto.response.EventResponse;
import com.charity.entity.CharityProject;
import com.charity.entity.Event;
import com.charity.entity.User;

public class EventMapper {
    public static EventResponse toResponse(Event event) {
        EventResponse.EventResponseBuilder builder = EventResponse.builder()
                .id(event.getId())
                .name(event.getName())
                .description(event.getDescription())
                .location(event.getLocation())
                .eventDate(event.getEventDate())
                .eventEndTime(event.getEventEndTime())
                .eventImageUrl(event.getEventImageUrl())
                .expectedAttendees(event.getExpectedAttendees())
                .actualAttendees(event.getActualAttendees())
                .status(event.getStatus())
                .organizedById(event.getOrganizedBy().getId())
                .organizerName(event.getOrganizedBy().getFullName())
                .registeredVolunteerIds(event.getRegisteredVolunteerIds())
                .createdAt(event.getCreatedAt());

        // Add project info if exists
        if (event.getProject() != null) {
            builder.projectId(event.getProject().getId())
                    .projectName(event.getProject().getName());
        }

        return builder.build();
    }

    public static Event toEntity(EventRequest request, User organizer, CharityProject project) {
        Event event = new Event();
        event.setName(request.getName());
        event.setDescription(request.getDescription());
        event.setLocation(request.getLocation());
        event.setEventDate(request.getEventDate());
        event.setEventEndTime(request.getEventEndTime());
        event.setEventImageUrl(request.getEventImageUrl());
        event.setExpectedAttendees(request.getExpectedAttendees());
        event.setStatus(request.getStatus());
        event.setOrganizedBy(organizer);
        event.setProject(project); // Can be null
        return event;
    }

    public static void updateEntity(Event event, EventRequest request, User organizer, CharityProject project) {
        if (request.getName() != null) event.setName(request.getName());
        if (request.getDescription() != null) event.setDescription(request.getDescription());
        if (request.getLocation() != null) event.setLocation(request.getLocation());
        if (request.getEventDate() != null) event.setEventDate(request.getEventDate());
        if (request.getEventEndTime() != null) event.setEventEndTime(request.getEventEndTime());
        if (request.getEventImageUrl() != null) event.setEventImageUrl(request.getEventImageUrl());
        if (request.getExpectedAttendees() != null) event.setExpectedAttendees(request.getExpectedAttendees());
        if (request.getStatus() != null) event.setStatus(request.getStatus());
        if (organizer != null) event.setOrganizedBy(organizer);
        if (project != null) event.setProject(project);
    }
}
