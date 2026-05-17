// ==================== DONATION ENTITY ====================
package com.charity.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;
import java.time.LocalDateTime;

@Entity
@Table(name = "donations")
@SQLRestriction("deleted = false")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Donation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.0", message = "Amount must be greater than 0")
    private Double amount;

    @NotBlank(message = "Donor name is required")
    private String donorName;

    @Email(message = "Email should be valid")
    private String donorEmail;

    private String donorPhone;

    private String donorWard; // Kenya-specific location

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Donation type is required")
    private DonationType donationType; // CASH, ITEM, SERVICE

    private String itemDescription; // If type is ITEM

    @ManyToOne
    @JoinColumn(name = "project_id")
    private CharityProject project; // Which project this donation is for

    @Enumerated(EnumType.STRING)
    private DonationStatus status; // PENDING, RECEIVED, USED

    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDateTime donatedAt;

    private LocalDateTime receivedAt;

    private boolean deleted = false;

    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        donatedAt = LocalDateTime.now();
        status = DonationStatus.PENDING;
    }
}