package com.charity.service;

import com.charity.config.JwtUtil;
import com.charity.dto.request.LoginRequest;
import com.charity.dto.request.RegisterRequest;
import com.charity.dto.response.LoginResponse;
import com.charity.entity.RefreshToken;
import com.charity.entity.User;
import com.charity.entity.UserRole;
import com.charity.exception.UserAlreadyExistsException;
import com.charity.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;
    @Mock private UserService userService;
    @Mock private RefreshTokenService refreshTokenService;

    @InjectMocks
    private AuthService authService;

    private User approvedUser;
    private User unapprovedUser;

    @BeforeEach
    void setUp() {
        approvedUser = new User();
        approvedUser.setId(1L);
        approvedUser.setEmail("test@example.com");
        approvedUser.setPassword("encodedPassword");
        approvedUser.setFullName("Test User");
        approvedUser.setRole(UserRole.VIEWER);
        approvedUser.setApproved(true);
        approvedUser.setWard("Kibra");
        approvedUser.setPhone("0712345678");

        unapprovedUser = new User();
        unapprovedUser.setId(2L);
        unapprovedUser.setEmail("pending@example.com");
        unapprovedUser.setPassword("encodedPassword");
        unapprovedUser.setApproved(false);
    }

    @Test
    void register_withNewEmail_savesUser() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("new@example.com");
        request.setPassword("Password1");
        request.setFullName("New User");
        request.setPhone("0712345679");
        request.setWard("Kibra");
        request.setRole(UserRole.VIEWER);

        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password1")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User result = authService.register(request);

        assertThat(result.getEmail()).isEqualTo("new@example.com");
        assertThat(result.getPassword()).isEqualTo("encoded");
        assertThat(result.isApproved()).isFalse();
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_withDuplicateEmail_throwsException() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setPassword("Password1");

        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(UserAlreadyExistsException.class)
                .hasMessageContaining("already in use");
    }

    @Test
    void login_withValidCredentials_returnsTokens() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("Password1");

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("refresh-token-value");
        refreshToken.setExpiresAt(LocalDateTime.now().plusDays(7));

        when(userService.getUserByEmail("test@example.com")).thenReturn(approvedUser);
        when(userService.verifyPassword("Password1", "encodedPassword")).thenReturn(true);
        when(jwtUtil.generateToken("test@example.com")).thenReturn("access-token");
        when(jwtUtil.getAccessTokenExpiration()).thenReturn(900000L);
        when(refreshTokenService.createRefreshToken("test@example.com", "USER")).thenReturn(refreshToken);

        LoginResponse response = authService.login(request);

        assertThat(response.getToken()).isEqualTo("access-token");
        assertThat(response.getRefreshToken()).isEqualTo("refresh-token-value");
        assertThat(response.getEmail()).isEqualTo("test@example.com");
    }

    @Test
    void login_withWrongPassword_throwsIllegalArgument() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("wrongPassword");

        when(userService.getUserByEmail("test@example.com")).thenReturn(approvedUser);
        when(userService.verifyPassword("wrongPassword", "encodedPassword")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void login_withUnapprovedUser_throwsIllegalState() {
        LoginRequest request = new LoginRequest();
        request.setEmail("pending@example.com");
        request.setPassword("Password1");

        when(userService.getUserByEmail("pending@example.com")).thenReturn(unapprovedUser);
        when(userService.verifyPassword("Password1", "encodedPassword")).thenReturn(true);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("pending approval");
    }
}
