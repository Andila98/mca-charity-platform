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
    @GeneratedValue(strategy = GenerationType.IDENTITY )
    private Long id;

    @NotBlank(message = "Username required")
    @Column(unique = true)
    private String username;

    @NotBlank(message = "Passworf is Required")
    @Size(min = 8 , message = "Password must be atleast 8 characters")
    private String password;

    @Enumerated( EnumType.STRING)
    private AdminRole role;

    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;

    @Column(columnDefinition = "BOOlEAN DEFAULT TRUE")
    private  boolean active;

    @PrePersist
    protected void onCreate(){
        createdAt = LocalDateTime.now();
        active = true;
    }
}