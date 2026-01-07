package com.mcacampaignplatform.volunteerservices.entity;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "volunteers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Volunteer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @Column(nullable=false)
    private String name;

    @Column(nullable=false)
    private String phone;
    private String email;

    @Column(nullable =false)
    private String ward;
    private String interest;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'ACTIVE'")
    private Status status;

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

    @Column(name="updated_at")
    private LocalDateTime updatedAT;

    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
        updatedAT = java.time.LocalDateTime.now();
        if (status == null) {
            status = Status.ACTIVE;
        }
    }

    @preUpdate
    protected void onUpdate(){
        updatedAT = java.time.LocalDateTime.now();
    }
}

/**
enum Status {
    ACTIVE, INACTIVE,SUSPENDED
}
 */
