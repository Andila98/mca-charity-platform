package com.charity.controller;

import com.charity.dto.request.AdminLoginRequest;
import com.charity.dto.response.AdminLoginResponse;
import com.charity.dto.response.ErrorResponse;
import com.charity.dto.response.SuccessResponse;
import com.charity.exception.AdminAuthException;
import com.charity.service.AdminAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5500",
        "http://localhost:8081",
        "http://127.0.0.1:5500",
        "http://127.0.0.1:3000",
        "file://"
})
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    /**
     * Admin login endpoint
     * POST /api/admin/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AdminLoginRequest request) {
        try {
            AdminLoginResponse response = adminAuthService.login(request);
            return ResponseEntity.ok(response);
        } catch (AdminAuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new   ErrorResponse("Authentication failed", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Server error", "An unexpected error occurred"));
        }
    }

    /**
     * Validate token endpoint (for frontend verification)
     * GET /api/admin/auth/validate
     */
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Invalid token", "Token must be Bearer format"));
            }

            String actualToken = token.replace("Bearer ", "");
            var admin = adminAuthService.validateToken(actualToken);

            return ResponseEntity.ok(new SuccessResponse("Token is valid"));
        } catch (AdminAuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Invalid token", e.getMessage()));
        }
    }
}
