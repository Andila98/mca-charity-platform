package com.charity.exception;

/**
 * Base exception for all charity platform exceptions
 */
public class CharityException extends RuntimeException {
    public CharityException(String message) {
        super(message);
    }

    public CharityException(String message, Throwable cause) {
        super(message, cause);
    }
}

