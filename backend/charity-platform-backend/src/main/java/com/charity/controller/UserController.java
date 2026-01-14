package com.charity.controller;


import com.charity.dto.request.UserRequest;
import com.charity.dto.response.UserResponse;
import com.charity.entity.User;
import com.charity.exception.UserNotFoundException;
import com.charity.mapper.UserMapper;
import com.charity.repository.UserRepository;
import com.charity.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    /**
     * Get all users
     */
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<User> users = userService.getAllApprovedUsers();
        List<UserResponse> response = users.stream()
                .map(UserMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Get user by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {

        // Service already throws exception if null, so just call it directly
        User user = userService.getUserById(id);
        return ResponseEntity.ok(UserMapper.toResponse(user));

        /**
         *User user = userService.getUserById(id)
                .orElse(null);

         *if (user == null) {
            return ResponseEntity.notFound().build()
         }

         *return ResponseEntity.ok(UserMapper.toResponse(user));
        */
    }

    /**
     * Get user by email
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {

        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(UserMapper.toResponse(user));

        /**
         *
         * User user = userService.getUserByEmail(email)
                .orElse(null);

         *if (user == null) {
            return ResponseEntity.notFound().build();
         }

         *return ResponseEntity.ok(UserMapper.toResponse(user));
         */
    }

    /**
     * Get unapproved users (Admin only)
     */
    @GetMapping("/unapproved")
    public ResponseEntity<List<UserResponse>> getUnapprovedUsers() {
        List<User> users = userService.getPendingApprovals();
        List<UserResponse> response = users.stream()
                .map(UserMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Update user
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserRequest request) {

        // Service already throws exception if null, so just call it directly
        User user = userService.getUserById(id);
        return ResponseEntity.ok(UserMapper.toResponse(user));

        /**
         * User user = userService.getUserById(id)
                .orElse(null);

         if (user == null) {
            return ResponseEntity.notFound().build();
        }

        UserMapper.updateEntity(user, request);
        User updatedUser = userService.updateUserProfile(id,user);

        return ResponseEntity.ok(UserMapper.toResponse(updatedUser));
        */
    }

    /**
     * Approve user (Admin only)
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveUser(@PathVariable Long id) {

        // Service already throws exception if null, so just call it directly
        User user = userService.getUserById(id);
        return ResponseEntity.ok(UserMapper.toResponse(user));

        /**
         *User user = userService.getUserById(id)
                .orElse(null);
         if (user == null) {
            return ResponseEntity.notFound().build();
         }

         user.setApproved(true);
         User approvedUser = userService.updateUser(user);

         return ResponseEntity.ok(UserMapper.toResponse(approvedUser));
         */
    }

    /**
     * Delete user
     * Note: Using userService.rejectUser() as defined in your Service
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            // 1. Service throws UserNotFoundException if ID doesn't exist
            userService.getUserById(id);

            // 2. Service uses 'rejectUser' for deletion logic
            userService.rejectUser(id);

            return ResponseEntity.ok("User deleted successfully");
        } catch (UserNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
