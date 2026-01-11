// ==================== VOLUNTEER ENTITY ====================
package com.charity.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "volunteers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Volunteer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Phone is required")
    private String phone;

    @NotBlank(message = "Ward is required")
    private String ward; // Kenya-specific location

    @ElementCollection
    @CollectionTable(name = "volunteer_interests", joinColumns = @JoinColumn(name = "volunteer_id"))
    @Column(name = "interest")
    private List<String> interests; // e.g., ["Education", "Healthcare", "Environment"]

    @Enumerated(EnumType.STRING)
    private VolunteerStatus status; // ACTIVE, INACTIVE, SUSPENDED

    private String bio;

    private String profileImageUrl;

    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime registeredAt;

    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime lastActiveAt;

    @PrePersist
    protected void onCreate() {
        registeredAt = LocalDateTime.now();
        status = VolunteerStatus.ACTIVE;
    }
}
