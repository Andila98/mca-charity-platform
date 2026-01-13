// ==================== USER SERVICE ====================
package com.charity.service;

import com.charity.entity.*;
import com.charity.repository.*;
import com.charity.exception.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;


@Transactional
@Service
@Slf4j
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Register a new user (signup)
     */
    public User registerUser(User user) {
        // Check if email already exists
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new UserAlreadyExistsException("Email already registered: " + user.getEmail());
        }

        // Check if phone already exists
        if (userRepository.existsByPhone(user.getPhone())) {
            throw new UserAlreadyExistsException("Phone already registered: " + user.getPhone());
        }

        // Encode password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(UserRole.VIEWER); // Default role for new users
        user.setApproved(false); // Require admin approval

        User savedUser = userRepository.save(user);
        log.info("New user registered: {} (ID: {})", user.getEmail(), savedUser.getId());
        return savedUser;
    }

    /**
     * Find user by email (for login)
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
    }

    /**
     * Find user by ID
     */
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));
    }

    /**
     * Get all approved users
     */
    public List<User> getAllApprovedUsers() {
        return userRepository.findByApprovedTrue();
    }

    /**
     * Get all pending approvals (unapproved users)
     */
    public List<User> getPendingApprovals() {
        return userRepository.findByApprovedFalse();
    }

    /**
     * Approve a user (admin only)
     */
    public User approveUser(Long userId) {
        User user = getUserById(userId);
        user.setApproved(true);
        User approvedUser = userRepository.save(user);
        log.info("User approved: {} (ID: {})", user.getEmail(), userId);
        return approvedUser;
    }

    /**
     * Reject a user (admin only)
     */
    public void rejectUser(Long userId) {
        userRepository.deleteById(userId);
        log.info("User rejected and deleted: ID {}", userId);
    }

    /**
     * Get all users with specific role
     */
    public List<User> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role);
    }

    /**
     * Get all users in a specific ward
     */
    public List<User> getUsersByWard(String ward) {
        return userRepository.findByWard(ward);
    }

    /**
     * Update user profile
     */
    public User updateUserProfile(Long userId, User updatedUser) {
        User existingUser = getUserById(userId);
        existingUser.setFullName(updatedUser.getFullName());
        existingUser.setPhone(updatedUser.getPhone());
        existingUser.setWard(updatedUser.getWard());
        existingUser.setProfileImageUrl(updatedUser.getProfileImageUrl());
        return userRepository.save(existingUser);
    }

    /**
     * Verify password for login
     */
    public boolean verifyPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    /**
     * Change user role (admin only)
     */
    public User changeUserRole(Long userId, UserRole newRole) {
        User user = getUserById(userId);
        user.setRole(newRole);
        User updatedUser = userRepository.save(user);
        log.info("User role changed: {} -> {} (ID: {})", user.getEmail(), newRole, userId);
        return updatedUser;
    }
}
