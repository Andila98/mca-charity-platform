// ==================== CHARITY PROJECT ENTITY ====================
package com.charity.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "charity_projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CharityProject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Project name is required")
    private String name;

    @NotBlank(message = "Description is required")
    @Column(columnDefinition = "TEXT")
    private String description;

    @NotBlank(message = "Ward is required")
    private String ward; // Kenya-specific location

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Status is required")
    private ProjectStatus status; // PLANNED, ONGOING, COMPLETED

    @Column(columnDefinition = "TEXT")
    private String impactSummary; // e.g., "Planted 500 trees, impacting 1000 residents"

    private String bannerImageUrl;

    private String category; // e.g., "Education", "Healthcare", "Environment"

    private int targetBeneficiaries;

    private int actualBeneficiaries;

    @Temporal(TemporalType.DATE)
    private LocalDateTime startDate;

    @Temporal(TemporalType.DATE)
    private LocalDateTime endDate;

    @ManyToOne
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy; // Which admin/editor created this

    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        status = ProjectStatus.PLANNED;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

// ==================== PROJECT STATUS ENUM ====================
enum ProjectStatus {
    PLANNED,
    ONGOING,
    COMPLETED
}
