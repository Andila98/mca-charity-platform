package com.charity.service;

import com.charity.config.JwtUtil;
import com.charity.dto.request.AdminLoginRequest;
import com.charity.dto.response.AdminLoginResponse;
import com.charity.entity.AdminUser;
import com.charity.exception.AdminAuthException;
import com.charity.repository.AdminUserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
@Slf4j
public class AdminAuthService {
    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Authenticate admin user and generate JWT token
     */
    public AdminLoginResponse login(AdminLoginRequest request) {

        // Step 1: Find admin by username
        AdminUser admin = adminUserRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> {
                    log.warn("Login attempt with non-existent username: {}", request.getUsername());
                    return new AdminAuthException("Invalid credentials");
                });

        // Step 2: Check if admin account is active
        if (!admin.isActive()) {
            log.warn("Login attempt on disabled account: {}", request.getUsername());
            throw new AdminAuthException("Admin account is disabled");
        }

        // Step 3: Verify password
        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            log.warn("Failed login attempt for admin: {}", request.getUsername());
            throw new AdminAuthException("Invalid credentials");
        }

        // Step 4: Update last login timestamp
        admin.setLastLogin(LocalDateTime.now());
        adminUserRepository.save(admin);
        log.info("Admin logged in successfully: {}", admin.getUsername());

        // Step 5: Generate JWT token (10 hours validity)
        String token = jwtUtil.generateToken(admin.getUsername());

        // Step 6: Return response
        return AdminLoginResponse.builder()
                .token(token)
                .username(admin.getUsername())
                .role(admin.getRole().toString())
                .loginTime(LocalDateTime.now())
                .expiresIn(10 * 60 * 60L) // 10 hours in seconds
                .message("Login successful")
                .build();
    }

    /**
     * Validate token and return admin info
     */
    public AdminUser validateToken(String token) {
        try {
            String username = jwtUtil.extractEmail(token); // Token stores username in 'subject'
            return adminUserRepository.findByUsername(username)
                    .orElseThrow(() -> new AdminAuthException("Admin not found"));
        } catch (Exception e) {
            throw new AdminAuthException("Invalid or expired token");
        }
    }

    /**
     * Create new admin user (SUPER_ADMIN only)
     */
    public AdminUser createAdmin(String username, String password, String role) {

        // Check if username already exists
        if (adminUserRepository.existsByUsername(username)) {
            throw new AdminAuthException("Username already exists");
        }

        AdminUser admin = new AdminUser();
        admin.setUsername(username);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setRole(com.charity.entity.AdminRole.valueOf(role));

        AdminUser saved = adminUserRepository.save(admin);
        log.info("New admin created: {}", username);

        return saved;
    }

    /**
     * Deactivate admin account
     */
    public void deactivateAdmin(Long adminId) {
        AdminUser admin = adminUserRepository.findById(adminId)
                .orElseThrow(() -> new AdminAuthException("Admin not found"));

        admin.setActive(false);
        adminUserRepository.save(admin);
        log.info("Admin deactivated: {}", admin.getUsername());
    }
}
