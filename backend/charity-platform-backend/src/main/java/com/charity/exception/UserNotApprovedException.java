package com.charity.exception;

/**
 * Thrown when user is not approved
 */
public class UserNotApprovedException extends CharityException {
    public UserNotApprovedException(String message) {
        super(message);
    }
}
