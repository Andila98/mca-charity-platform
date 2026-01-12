package com.charity.exception;

/**
 * Thrown when user is not found
 */
public class UserNotFoundException extends CharityException {
    public UserNotFoundException(String message) {
        super(message);
    }
}