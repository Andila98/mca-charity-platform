package com.charity.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Enhanced Error Response DTO
 * Provides consistent error structure across all API endpoints
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    /**
     * Timestamp of when error occurred
     */
    private LocalDateTime timestamp;

    /**
     * HTTP status code (e.g., 404, 500)
     */
    private int status;

    /**
     * Error type/category (e.g., "User Not Found", "Validation Error")
     */
    private String error;

    /**
     * Human-readable error message
     */
    private String message;

    /**
     * API endpoint path where error occurred
     */
    private String path;

    /**
     * Additional details (optional)
     */
    private Object details;

    /**
     * Create simple error response with message only
     * (for backward compatibility with existing code)
     */
    public ErrorResponse(String error, String message) {
        this.timestamp = LocalDateTime.now();
        this.error = error;
        this.message = message;
    }
}







