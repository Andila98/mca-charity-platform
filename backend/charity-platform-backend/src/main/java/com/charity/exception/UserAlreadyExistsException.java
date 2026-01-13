// ==================== USER EXCEPTIONS ====================
package com.charity.exception;

/**
 * Thrown when user already exists
 */
public class UserAlreadyExistsException extends CharityException {
    public UserAlreadyExistsException(String message) {
        super(message);
    }
}
