package com.charity.repository;

import com.charity.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

// ==================== USER REPOSITORY ====================
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    /**
     * Find user by email for login
     */
    Optional<User> findByEmail(String email);

    /**
     * Find user by phone number
     */
    Optional<User> findByPhone(String phone);

    /**
     * Find all users with a specific role
     */
    List<User> findByRole(UserRole role);

    /**
     * Find all approved users (for security)
     */
    List<User> findByIsApprovedTrue();

    /**
     * Find all unapproved users (for admin to review)
     */
    List<User> findByIsApprovedFalse();

    /**
     * Find all users in a specific ward (Kenya-specific)
     */
    List<User> findByWard(String ward);

    /**
     * Check if email already exists
     */
    boolean existsByEmail(String email);

    /**
     * Check if phone already exists
     */
    boolean existsByPhone(String phone);
}
