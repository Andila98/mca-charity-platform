package com.charity.exception;

/**
 * Thrown when project operation is invalid
 */
public class InvalidProjectException extends CharityException {
    public InvalidProjectException(String message) {
        super(message);
    }
}
