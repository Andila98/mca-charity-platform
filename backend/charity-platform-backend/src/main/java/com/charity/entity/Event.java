// ==================== EVENT ENTITY ====================
package com.charity.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Event name is required")
    private String name;

    @NotBlank(message = "Description is required")
    @Column(columnDefinition = "TEXT")
    private String description;

    @NotBlank(message = "Location/Ward is required")
    private String location; // e.g., "Kibra High School, Nairobi"

    @NotNull(message = "Event date is required")
    private LocalDateTime eventDate;

    private LocalDateTime eventEndTime;

    private String eventImageUrl;

    private int expectedAttendees;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private CharityProject project; // Can be linked to a project

    @ManyToOne
    @JoinColumn(name = "organized_by_id", nullable = false)
    private User organizedBy;

    @ElementCollection
    @CollectionTable(name = "event_volunteers", joinColumns = @JoinColumn(name = "event_id"))
    @Column(name = "volunteer_id")
    private List<Long> registeredVolunteerIds; // List of volunteer IDs signed up

    private int actualAttendees;

    @Enumerated(EnumType.STRING)
    private EventStatus status; // PLANNED, ONGOING, COMPLETED, CANCELLED

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        status = EventStatus.PLANNED;
    }
}

