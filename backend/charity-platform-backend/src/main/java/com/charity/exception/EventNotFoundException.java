// ==================== EVENT EXCEPTIONS ====================
package com.charity.exception;

/**
 * Thrown when event is not found
 */
public class EventNotFoundException extends CharityException {
    public EventNotFoundException(String message) {
        super(message);
    }
}