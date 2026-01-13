package com.charity.exception;

/**
 * Thrown when donation amount is invalid
 */
public class InvalidDonationException extends CharityException {
    public InvalidDonationException(String message) {
        super(message);
    }
}