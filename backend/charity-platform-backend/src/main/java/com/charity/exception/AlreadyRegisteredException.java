package com.charity.exception;

/**
 * Thrown when volunteer already registered for event
 */
public class AlreadyRegisteredException extends CharityException {
    public AlreadyRegisteredException(String message) {
        super(message);
    }
}
