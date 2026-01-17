package com.charity.dto.request;


import com.charity.entity.EventStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventRequest {
    @NotBlank(message = "Event name is required")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Event date is required")
    private LocalDateTime eventDate;

    private LocalDateTime eventEndTime;
    private String eventImageUrl;

    @NotNull(message = "Expected attendees is required")
    private Integer expectedAttendees;

    private Long projectId; // Optional: link to a charity project

    @NotNull(message = "Organizer ID is required")
    private Long organizedById; // User ID

    private EventStatus status;
}
