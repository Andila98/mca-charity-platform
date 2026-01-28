package com.charity.service;

import com.charity.config.JwtUtil;
import com.charity.dto.request.LoginRequest;
import com.charity.dto.request.RegisterRequest;
import com.charity.dto.response.LoginResponse;
import com.charity.entity.User;
import com.charity.exception.UserAlreadyExistsException;
import com.charity.mapper.UserMapper;
import com.charity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Error: Email is already in use!");
        }

        User user = UserMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        return userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userService.getUserByEmail(request.getEmail());

        if (!userService.verifyPassword(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Error: Invalid email or password");
        }

        if (!user.isApproved()) {
            throw new IllegalStateException("Error: Your account is pending approval");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        return new LoginResponse(
                token,
                user.getEmail(),
                user.getFullName(),
                user.getRole().toString(),
                "Login successful"
        );
    }
}
