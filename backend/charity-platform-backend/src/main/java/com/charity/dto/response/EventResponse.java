package com.charity.dto.response;


import com.charity.entity.EventStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventResponse {

    private Long id;
    private String name;
    private String description;
    private String location;
    private LocalDateTime eventDate;
    private LocalDateTime eventEndTime;
    private String eventImageUrl;
    private Integer expectedAttendees;
    private Integer actualAttendees;
    private EventStatus status;
    private Long projectId;
    private String projectName; // Optional: project name if linked
    private Long organizedById;
    private String organizerName; // User's full name
    private List<Long> registeredVolunteerIds;
    private LocalDateTime createdAt;
}
