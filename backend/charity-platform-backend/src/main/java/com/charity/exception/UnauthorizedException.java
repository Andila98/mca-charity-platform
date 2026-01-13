package com.charity.exception;

/**
 * Thrown when user lacks required role
 */
public class UnauthorizedException extends CharityException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
