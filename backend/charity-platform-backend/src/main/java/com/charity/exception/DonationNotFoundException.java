// ==================== DONATION EXCEPTIONS ====================
package com.charity.exception;

/**
 * Thrown when donation is not found
 */
public class DonationNotFoundException extends CharityException {
    public DonationNotFoundException(String message) {
        super(message);
    }
}