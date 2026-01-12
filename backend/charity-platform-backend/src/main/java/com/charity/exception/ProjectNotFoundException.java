// ==================== PROJECT EXCEPTIONS ====================
package com.charity.exception;

/**
 * Thrown when project is not found
 */
public class ProjectNotFoundException extends CharityException {
    public ProjectNotFoundException(String message) {
        super(message);
    }
}