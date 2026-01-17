package com.charity.controller;


import com.charity.config.JwtUtil;
import com.charity.dto.request.LoginRequest;
import com.charity.dto.request.RegisterRequest;
import com.charity.dto.response.LoginResponse;
import com.charity.dto.response.UserResponse;
import com.charity.entity.User;
import com.charity.mapper.UserMapper;
import com.charity.repository.UserRepository;
import com.charity.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * Register a new user
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest()
                    .body("Error: Email is already in use!");
        }

        // Create new user
        User user = UserMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);
        UserResponse response = UserMapper.toResponse(savedUser);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Login and get JWT token
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error: Invalid email or password");
        }

        // Check if password matches
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error: Invalid email or password");
        }

        // Check if user is approved
        if (!user.isApproved()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Error: Your account is pending approval");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail());

        LoginResponse response = new LoginResponse(
                token,
                user.getEmail(),
                user.getFullName(),
                user.getRole().toString(),
                "Login successful"
        );

        return ResponseEntity.ok(response);
    }
}
