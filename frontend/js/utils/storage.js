/**
 * Local Storage Utility
 * Safe wrapper around localStorage with error handling
 */

class StorageUtil {
    /**
     * Set item in localStorage
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     */
    static set(key, value) {
        try {
            const data = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(key, data);
        } catch (error) {
            console.error('Storage set error:', error);
        }
    }

    /**
     * Get item from localStorage
     * @param {string} key - Storage key
     * @returns {any} Stored value or null
     */
    static get(key) {
        try {
            const data = localStorage.getItem(key);
            if (!data) return null;

            // Try to parse as JSON
            try {
                return JSON.parse(data);
            } catch {
                // Return as string if not JSON
                return data;
            }
        } catch (error) {
            console.error('Storage get error:', error);
            return null;
        }
    }

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     */
    static remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Storage remove error:', error);
        }
    }

    /**
     * Clear all localStorage
     */
    static clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Storage clear error:', error);
        }
    }

    /**
     * Check if key exists
     * @param {string} key - Storage key
     * @returns {boolean}
     */
    static has(key) {
        return localStorage.getItem(key) !== null;
    }
}