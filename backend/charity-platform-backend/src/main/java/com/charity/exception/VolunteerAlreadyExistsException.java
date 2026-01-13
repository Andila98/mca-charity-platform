// ==================== VOLUNTEER EXCEPTIONS ====================
package com.charity.exception;


/**
 * Thrown when volunteer already exists
 */
public class VolunteerAlreadyExistsException extends CharityException {
    public VolunteerAlreadyExistsException(String message) {
        super(message);
    }
}
