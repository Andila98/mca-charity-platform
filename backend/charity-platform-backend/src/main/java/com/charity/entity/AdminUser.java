package com.charity.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_users")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Username required")
    @Column(unique = true)
    private String username;

    /**
     * FIX #3: Removed @Size(min=8) from the entity field.
     * After BCrypt encoding the stored value is always 60 chars — the @Size
     * annotation belongs on the DTO (AdminLoginRequest / a CreateAdminRequest),
     * NOT on the already-encoded password stored here.
     */
    @NotBlank(message = "Password is required")
    private String password;

    @Enumerated(EnumType.STRING)
    private AdminRole role;

    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;

    /**
     * FIX #8 (minor): Fixed typo "BOOlEAN" → column definition removed entirely.
     * The @PrePersist already sets active = true, so a DDL default is redundant.
     */
    @Column(nullable = false)
    private boolean active;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        active = true;
    }
}