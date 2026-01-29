/**
 * Validation Utility
 * Common validation functions
 */

class ValidationUtil {
    /**
     * Validate email format
     * @param {string} value - Email to validate
     * @returns {boolean}
     */
    static email(value) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(value);
    }

    /**
     * Validate phone number
     * @param {string} value - Phone to validate
     * @returns {boolean}
     */
    static phone(value) {
        const cleaned = value.replace(/\D/g, '');
        return cleaned.length >= 9;
    }

    /**
     * Check if value is not empty
     * @param {string} value - Value to check
     * @returns {boolean}
     */
    static required(value) {
        return value && value.trim().length > 0;
    }

    /**
     * Check minimum length
     * @param {string} value - Value to check
     * @param {number} min - Minimum length
     * @returns {boolean}
     */
    static minLength(value, min) {
        return value && value.length >= min;
    }

    /**
     * Check if value is a number
     * @param {any} value - Value to check
     * @returns {boolean}
     */
    static number(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    /**
     * Check if value is positive number
     * @param {any} value - Value to check
     * @returns {boolean}
     */
    static positiveNumber(value) {
        return this.number(value) && parseFloat(value) > 0;
    }
}