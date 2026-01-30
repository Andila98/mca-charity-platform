/**
 * Generic API Service
 * Handles all HTTP requests with error handling, retries, and authentication
 */

class APIService {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.version = API_CONFIG.VERSION;
        this.timeout = API_CONFIG.TIMEOUT;
        this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
        this.retryDelay = API_CONFIG.RETRY_DELAY;
    }

    /**
     * Generic request method
     * @param {string} endpoint - API endpoint
     * @param {object} options - Fetch options
     * @param {number} retryCount - Current retry attempt
     * @returns {Promise} Response data
     */
    async request(endpoint, options = {}, retryCount = 0) {
        const url = `${this.baseURL}/${this.version}${endpoint}`;
        
        // Merge default options with provided options
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeader(),
                ...options.headers
            },
            ...options
        };

        try {
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            
            config.signal = controller.signal;

            const response = await fetch(url, config);
            clearTimeout(timeoutId);

            // Handle HTTP errors
            if (!response.ok) {
                await this.handleHTTPError(response);
            }

            // Parse response
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }

        } catch (error) {
            // Handle network errors and timeouts
            if (error.name === 'AbortError') {
                throw new APIError('Request timeout', 408);
            }

            // Retry logic for network errors
            if (
                retryCount < this.retryAttempts &&
                (!error.status || error.status >= 500)
            ) {
                console.warn(`Request failed, retrying... (${retryCount + 1}/${this.retryAttempts})`);
                await this.delay(this.retryDelay);
                return this.request(endpoint, options, retryCount + 1);
            }

            throw new APIError(error.message, 0);
        }
    }

    /**
     * GET request
     * @param {string} endpoint - API endpoint
     * @param {object} params - Query parameters
     * @returns {Promise} Response data
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(url, { method: 'GET' });
    }

    /**
     * POST request
     * @param {string} endpoint - API endpoint
     * @param {object} data - Request body
     * @returns {Promise} Response data
     */
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     * @param {string} endpoint - API endpoint
     * @param {object} data - Request body
     * @returns {Promise} Response data
     */
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * PATCH request
     * @param {string} endpoint - API endpoint
     * @param {object} data - Request body
     * @returns {Promise} Response data
     */
    async patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     * @param {string} endpoint - API endpoint
     * @returns {Promise} Response data
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    /**
     * Upload file (multipart/form-data)
     * @param {string} endpoint - API endpoint
     * @param {FormData} formData - Form data with file
     * @returns {Promise} Response data
     */
    async uploadFile(endpoint, formData) {
        const url = `${this.baseURL}/${this.version}${endpoint}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                ...this.getAuthHeader()
                // Don't set Content-Type for FormData - browser will set it
            },
            body: formData
        });

        if (!response.ok) {
            await this.handleHTTPError(response);
        }

        return await response.json();
    }

    /**
     * Get authorization header
     * @returns {object} Authorization header
     */
    getAuthHeader() {
        const adminToken = StorageUtil.get('admin_auth_token');
        const userToken = StorageUtil.get('auth_token');
        const token = adminToken || userToken;
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    /**
     * Handle HTTP errors
     * @param {Response} response - Fetch response
     * @throws {APIError}
     */
    async handleHTTPError(response) {
        let errorMessage = 'Request failed';
        let errorDetails = null;

        try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                errorDetails = await response.json();
                errorMessage = errorDetails.message || errorMessage;
            } else {
                errorMessage = await response.text();
            }
        } catch (e) {
            // If parsing fails, use status text
            errorMessage = response.statusText;
        }

        // Handle 401 Unauthorized - redirect to login
        if (response.status === 401) {
            this.handleUnauthorized();
        }

        throw new APIError(errorMessage, response.status, errorDetails);
    }

    /**
     * Handle unauthorized access
     */
    handleUnauthorized() {
        // Clear auth data
        StorageUtil.remove('auth_token');
        StorageUtil.remove('admin_auth_token');
        StorageUtil.remove('user_data');

        // Show notification
        if (typeof ToastNotification !== 'undefined') {
            ToastNotification.error('Your session has expired. Please login again.');
        }

        const isAdminRoute = window.location.pathname.includes('/admin');
        const loginPath = isAdminRoute ? '/pages/admin/login.html' : '/login.html';

        // Redirect to login after a short delay
        setTimeout(() => {
            window.location.href = loginPath;
        }, 1200);
    }

    /**
     * Delay helper for retry logic
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Custom API Error class
 */
class APIError extends Error {
    constructor(message, status, details = null) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.details = details;
    }

    toString() {
        return `${this.name} (${this.status}): ${this.message}`;
    }
}

// Create singleton instance
const apiService = new APIService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIService, APIError, apiService };
}