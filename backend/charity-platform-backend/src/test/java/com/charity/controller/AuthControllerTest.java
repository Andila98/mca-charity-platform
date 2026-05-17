package com.charity.controller;

import com.charity.config.JwtUtil;
import com.charity.dto.request.LoginRequest;
import com.charity.dto.request.RegisterRequest;
import com.charity.dto.response.LoginResponse;
import com.charity.entity.RefreshToken;
import com.charity.entity.User;
import com.charity.entity.UserRole;
import com.charity.exception.UserAlreadyExistsException;
import com.charity.service.AuthService;
import com.charity.service.RefreshTokenService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import(AuthControllerTest.TestSecurityConfig.class)
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private AuthService authService;
    @MockitoBean private RefreshTokenService refreshTokenService;
    @MockitoBean private JwtUtil jwtUtil;

    /** Disable security for controller tests — we test auth logic separately */
    @Configuration
    static class TestSecurityConfig {
        @Bean
        SecurityFilterChain testChain(HttpSecurity http) throws Exception {
            http.csrf(c -> c.disable())
                .authorizeHttpRequests(a -> a.anyRequest().permitAll());
            return http.build();
        }
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private RegisterRequest validRegisterRequest() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("user@example.com");
        req.setPassword("Password1");
        req.setFullName("Test User");
        req.setPhone("0712345678");
        req.setWard("Kibra");
        req.setRole(UserRole.VIEWER);
        return req;
    }

    private User savedUser() {
        User user = new User();
        user.setId(1L);
        user.setEmail("user@example.com");
        user.setFullName("Test User");
        user.setRole(UserRole.VIEWER);
        user.setWard("Kibra");
        user.setPhone("0712345678");
        return user;
    }

    private RefreshToken refreshToken(String tokenValue) {
        RefreshToken t = new RefreshToken();
        t.setToken(tokenValue);
        t.setSubject("user@example.com");
        t.setSubjectType("USER");
        t.setRevoked(false);
        t.setExpiresAt(LocalDateTime.now().plusDays(7));
        return t;
    }

    // ── register ──────────────────────────────────────────────────────────────

    @Test
    void register_withValidRequest_returns201() throws Exception {
        when(authService.register(any(RegisterRequest.class))).thenReturn(savedUser());

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRegisterRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void register_withDuplicateEmail_returns400() throws Exception {
        when(authService.register(any(RegisterRequest.class)))
                .thenThrow(new UserAlreadyExistsException("Email already in use"));

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRegisterRequest())))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_withWeakPassword_returns400() throws Exception {
        RegisterRequest req = validRegisterRequest();
        req.setPassword("weak"); // no uppercase, no digit, too short

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_withInvalidWard_returns400() throws Exception {
        RegisterRequest req = validRegisterRequest();
        req.setWard("NotARealWard");

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    /**
     * Privilege escalation guard: a client sending role=ADMIN must not receive
     * an admin account. The service layer enforces VIEWER; the controller must
     * still return 201 (the request itself is not malformed), but the saved
     * user's role must be VIEWER.
     */
    @Test
    void register_withAdminRole_isDowngradedToViewer() throws Exception {
        RegisterRequest req = validRegisterRequest();
        req.setRole(UserRole.ADMIN);

        User saved = savedUser();
        saved.setRole(UserRole.VIEWER); // service always enforces VIEWER

        when(authService.register(any(RegisterRequest.class))).thenReturn(saved);

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("VIEWER"));
    }

    // ── login ─────────────────────────────────────────────────────────────────

    @Test
    void login_withValidCredentials_returns200WithTokens() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("user@example.com");
        req.setPassword("Password1");

        LoginResponse loginResponse = new LoginResponse(
                "access-token", "refresh-token", 900L,
                "user@example.com", "Test User", "VIEWER", "Login successful"
        );
        when(authService.login(any(LoginRequest.class))).thenReturn(loginResponse);

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("access-token"))
                // refreshToken must be absent from the body — delivered via httpOnly cookie only
                .andExpect(jsonPath("$.refreshToken").value(nullValue()))
                .andExpect(header().exists("Set-Cookie"))
                .andExpect(header().string("Set-Cookie", containsString("HttpOnly")))
                .andExpect(header().string("Set-Cookie", containsString("SameSite=Strict")));
    }

    @Test
    void login_withWrongPassword_returns401() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("user@example.com");
        req.setPassword("wrongPassword");

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new IllegalArgumentException("Invalid credentials"));

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_withUnapprovedUser_returns403WithFixedMessage() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("pending@example.com");
        req.setPassword("Password1");

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new IllegalStateException("Your account is pending approval"));

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden())
                // Response must use a fixed string, not the raw exception message
                .andExpect(content().string("Error: Your account is pending approval"));
    }

    // ── refresh ───────────────────────────────────────────────────────────────

    @Test
    void refresh_withValidCookie_returns200WithNewAccessToken() throws Exception {
        RefreshToken old = refreshToken("valid-refresh");
        RefreshToken rotated = refreshToken("rotated-refresh");

        when(refreshTokenService.verifyRefreshToken("valid-refresh")).thenReturn(old);
        when(refreshTokenService.rotateRefreshToken(old)).thenReturn(rotated);
        when(jwtUtil.generateToken("user@example.com")).thenReturn("new-access-token");
        when(jwtUtil.getAccessTokenExpiration()).thenReturn(900000L);

        mockMvc.perform(post("/api/v1/auth/refresh")
                .cookie(new jakarta.servlet.http.Cookie("refresh_token", "valid-refresh")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("new-access-token"))
                .andExpect(header().exists("Set-Cookie"))
                .andExpect(header().string("Set-Cookie", containsString("HttpOnly")))
                .andExpect(header().string("Set-Cookie", containsString("SameSite=Strict")));
    }

    @Test
    void refresh_withoutCookie_returns401() throws Exception {
        mockMvc.perform(post("/api/v1/auth/refresh"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void refresh_withExpiredToken_returns401AndClearsCookie() throws Exception {
        when(refreshTokenService.verifyRefreshToken("expired-token"))
                .thenThrow(new IllegalArgumentException("Token has expired"));

        mockMvc.perform(post("/api/v1/auth/refresh")
                .cookie(new jakarta.servlet.http.Cookie("refresh_token", "expired-token")))
                .andExpect(status().isUnauthorized())
                // Cookie must be cleared so the stale token doesn't linger in the browser
                .andExpect(header().exists("Set-Cookie"))
                .andExpect(header().string("Set-Cookie", containsString("Max-Age=0")));
    }

    @Test
    void refresh_withRevokedToken_returns401AndClearsCookie() throws Exception {
        when(refreshTokenService.verifyRefreshToken("revoked-token"))
                .thenThrow(new IllegalArgumentException("Token has been revoked"));

        mockMvc.perform(post("/api/v1/auth/refresh")
                .cookie(new jakarta.servlet.http.Cookie("refresh_token", "revoked-token")))
                .andExpect(status().isUnauthorized())
                .andExpect(header().exists("Set-Cookie"))
                .andExpect(header().string("Set-Cookie", containsString("Max-Age=0")));
    }

    // ── logout ────────────────────────────────────────────────────────────────

    @Test
    void logout_withValidCookie_returns200AndClearsCookie() throws Exception {
        RefreshToken token = refreshToken("valid-refresh");
        when(refreshTokenService.verifyRefreshToken("valid-refresh")).thenReturn(token);

        mockMvc.perform(post("/api/v1/auth/logout")
                .cookie(new jakarta.servlet.http.Cookie("refresh_token", "valid-refresh")))
                .andExpect(status().isOk())
                .andExpect(header().exists("Set-Cookie"))
                .andExpect(header().string("Set-Cookie", containsString("Max-Age=0")));

        verify(refreshTokenService).revokeAllForSubject("user@example.com", "USER");
    }

    @Test
    void logout_withInvalidToken_returns200AndClearsCookie() throws Exception {
        when(refreshTokenService.verifyRefreshToken("bad-token"))
                .thenThrow(new IllegalArgumentException("Token not found"));

        mockMvc.perform(post("/api/v1/auth/logout")
                .cookie(new jakarta.servlet.http.Cookie("refresh_token", "bad-token")))
                .andExpect(status().isOk())
                // Cookie must still be cleared even when the token is already invalid
                .andExpect(header().exists("Set-Cookie"))
                .andExpect(header().string("Set-Cookie", containsString("Max-Age=0")));

        verify(refreshTokenService, never()).revokeAllForSubject(anyString(), anyString());
    }

    @Test
    void logout_withoutCookie_returns200() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout"))
                .andExpect(status().isOk());

        verify(refreshTokenService, never()).revokeAllForSubject(anyString(), anyString());
    }
}
