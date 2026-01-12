package com.charity.exception;

/**
 * Thrown when volunteer is not found
 */
public class VolunteerNotFoundException extends CharityException {
    public VolunteerNotFoundException(String message) {
        super(message);
    }
}
