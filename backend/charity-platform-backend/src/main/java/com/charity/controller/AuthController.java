package com.charity.controller;

import com.charity.config.JwtUtil;
import com.charity.dto.request.LoginRequest;
import com.charity.dto.request.RegisterRequest;
import com.charity.dto.response.LoginResponse;
import com.charity.dto.response.TokenRefreshResponse;
import com.charity.dto.response.UserResponse;
import com.charity.entity.RefreshToken;
import com.charity.entity.User;
import com.charity.exception.UserAlreadyExistsException;
import com.charity.exception.UserNotFoundException;
import com.charity.mapper.UserMapper;
import com.charity.service.AuthService;
import com.charity.service.RefreshTokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User registration, login, token refresh, and logout")
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final JwtUtil jwtUtil;

    @Value("${jwt.refresh-token-expiration-days:7}")
    private int refreshTokenExpirationDays;

    @Value("${cookie.secure:false}")
    private boolean cookieSecure;

    @Operation(summary = "Register a new user")
    @ApiResponse(responseCode = "201", description = "User registered successfully")
    @ApiResponse(responseCode = "400", description = "Validation error or email already in use")
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User savedUser = authService.register(request);
            UserResponse response = UserMapper.toResponse(savedUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (UserAlreadyExistsException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Login", description = "Returns an access token in the body and sets an httpOnly refresh-token cookie")
    @ApiResponse(responseCode = "200", description = "Login successful")
    @ApiResponse(responseCode = "401", description = "Invalid credentials")
    @ApiResponse(responseCode = "403", description = "Account pending approval")
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletResponse servletResponse) {
        try {
            LoginResponse response = authService.login(request);
            setRefreshCookie(servletResponse, response.getRefreshToken());
            // Do not expose the refresh token in the response body
            response.setRefreshToken(null);
            return ResponseEntity.ok(response);
        } catch (UserNotFoundException | IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error: Invalid email or password");
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Error: Your account is pending approval");
        }
    }

    @Operation(summary = "Refresh access token", description = "Reads the refresh-token cookie, rotates it, and returns a new access token")
    @ApiResponse(responseCode = "200", description = "New access token issued")
    @ApiResponse(responseCode = "401", description = "Refresh token missing, expired, or revoked")
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            @CookieValue(name = "refresh_token", required = false) String rawToken,
            HttpServletResponse servletResponse) {
        if (rawToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Missing refresh token");
        }
        try {
            RefreshToken old = refreshTokenService.verifyRefreshToken(rawToken);
            RefreshToken rotated = refreshTokenService.rotateRefreshToken(old);
            String newAccessToken = jwtUtil.generateToken(old.getSubject());
            setRefreshCookie(servletResponse, rotated.getToken());
            return ResponseEntity.ok(new TokenRefreshResponse(
                    newAccessToken, null, jwtUtil.getAccessTokenExpiration() / 1000));
        } catch (IllegalArgumentException e) {
            clearRefreshCookie(servletResponse);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: " + e.getMessage());
        }
    }

    @Operation(summary = "Logout", description = "Revokes the refresh token and clears the httpOnly cookie")
    @ApiResponse(responseCode = "200", description = "Logged out successfully")
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @CookieValue(name = "refresh_token", required = false) String rawToken,
            HttpServletResponse servletResponse) {
        if (rawToken != null) {
            try {
                RefreshToken token = refreshTokenService.verifyRefreshToken(rawToken);
                refreshTokenService.revokeAllForSubject(token.getSubject(), token.getSubjectType());
            } catch (IllegalArgumentException ignored) {
                // Already invalid — still clear the cookie
            }
        }
        clearRefreshCookie(servletResponse);
        return ResponseEntity.ok("Logged out successfully");
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private void setRefreshCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from("refresh_token", token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/api/v1/auth")
                .maxAge(Duration.ofDays(refreshTokenExpirationDays))
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/api/v1/auth")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
