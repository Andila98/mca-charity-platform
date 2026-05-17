package com.charity.controller;

import com.charity.config.JwtUtil;
import com.charity.dto.request.AdminLoginRequest;
import com.charity.dto.response.AdminLoginResponse;
import com.charity.dto.response.ErrorResponse;
import com.charity.dto.response.SuccessResponse;
import com.charity.dto.response.TokenRefreshResponse;
import com.charity.entity.RefreshToken;
import com.charity.exception.AdminAuthException;
import com.charity.service.AdminAuthService;
import com.charity.service.RefreshTokenService;
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
@RequestMapping("/api/v1/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService adminAuthService;
    private final RefreshTokenService refreshTokenService;
    private final JwtUtil jwtUtil;

    @Value("${jwt.refresh-token-expiration-days:7}")
    private int refreshTokenExpirationDays;

    @Value("${cookie.secure:false}")
    private boolean cookieSecure;

    /**
     * Admin login — returns access token in body, sets refresh token as httpOnly cookie.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AdminLoginRequest request, HttpServletResponse servletResponse) {
        try {
            AdminLoginResponse response = adminAuthService.login(request);
            setRefreshCookie(servletResponse, response.getRefreshToken());
            response.setRefreshToken(null);
            return ResponseEntity.ok(response);
        } catch (AdminAuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Authentication failed", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Server error", "An unexpected error occurred"));
        }
    }

    /**
     * Validate token endpoint (for frontend verification).
     */
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Invalid token", "Token must be Bearer format"));
            }
            String actualToken = token.replace("Bearer ", "");
            adminAuthService.validateToken(actualToken);
            return ResponseEntity.ok(new SuccessResponse("Token is valid"));
        } catch (AdminAuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Invalid token", e.getMessage()));
        }
    }

    /**
     * Refresh — reads refresh token from httpOnly cookie, rotates it, sets new cookie.
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            @CookieValue(name = "admin_refresh_token", required = false) String rawToken,
            HttpServletResponse servletResponse) {
        if (rawToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Token error", "Missing refresh token"));
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
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Token error", e.getMessage()));
        }
    }

    /**
     * Logout — revokes the admin refresh token and clears the cookie.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @CookieValue(name = "admin_refresh_token", required = false) String rawToken,
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
        return ResponseEntity.ok(new SuccessResponse("Logged out successfully"));
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private void setRefreshCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from("admin_refresh_token", token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/api/v1/admin/auth")
                .maxAge(Duration.ofDays(refreshTokenExpirationDays))
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("admin_refresh_token", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/api/v1/admin/auth")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
