/**
 * API Client with Authentication Support
 * Handles all communication with backend API
 */
class APIClient {
    constructor(baseURL = 'http://localhost:8080/api/v1') {
        this.baseURL = baseURL;
        this.authToken = this.loadToken();
    }

    /**
     * Load JWT token from localStorage
     * @private
     */
    loadToken() {
        return localStorage.getItem('auth_token') || localStorage.getItem('admin_token');
    }

    /**
     * Save JWT token to localStorage
     */
    setToken(token) {
        this.authToken = token;
        localStorage.setItem('auth_token', token);
    }

    /**
     * Remove JWT token
     */
    clearToken() {
        this.authToken = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('admin_token');
    }

    /**
     * Get headers with authentication
     * @private
     */
    getHeaders(customHeaders = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...customHeaders
        };

        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }

        return headers;
    }

    /**
     * Make HTTP request
     * @private
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        const config = {
            ...options,
            headers: this.getHeaders(options.headers)
        };

        try {
            const response = await fetch(url, config);

            // Handle 401 Unauthorized (token expired/invalid)
            if (response.status === 401) {
                this.clearToken();

                // Redirect to login if not already there
                if (!window.location.pathname.includes('login') &&
                    !window.location.pathname.includes('index')) {
                    window.location.href = '/index.html';
                }

                throw new Error('Authentication required. Please login.');
            }

            // Handle other error responses
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            // Parse successful response
            const data = await response.json();
            return data;

        } catch (error) {
            console.error('API Request Error:', error);
            this.handleError(error);
            throw error;
        }
    }

    /**
     * Handle errors with user-friendly messages
     * @private
     */
    handleError(error) {
        if (error.message.includes('Failed to fetch')) {
            alert('❌ Cannot connect to server. Please check if the backend is running.');
        } else if (error.message.includes('Authentication required')) {
            // Already handled by redirecting to login
        } else {
            console.error('Unhandled error:', error.message);
        }
    }

    /**
     * GET request
     */
    async get(endpoint) {
        return this.request(endpoint, {
            method: 'GET'
        });
    }

    /**
     * POST request
     */
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     */
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    /**
     * PATCH request
     */
    async patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    /**
     * Upload file (multipart/form-data)
     */
    async uploadFile(endpoint, formData) {
        const url = `${this.baseURL}${endpoint}`;

        const headers = {};
        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }
        // Don't set Content-Type for FormData - browser sets it automatically with boundary

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: formData
            });

            if (response.status === 401) {
                this.clearToken();
                window.location.href = '/index.html';
                throw new Error('Authentication required');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Upload failed');
            }

            return await response.json();

        } catch (error) {
            console.error('Upload Error:', error);
            throw error;
        }
    }
}

// ============================================================
// SPECIALIZED API CLIENTS
// ============================================================

/**
 * Public API Client (no authentication required)
 */
class PublicAPIClient extends APIClient {
    constructor() {
        super();
    }

    // Projects
    async getProjects() {
        return this.get('/projects');
    }

    async getProject(id) {
        return this.get(`/projects/${id}`);
    }

    // Events
    async getEvents() {
        return this.get('/events');
    }

    async getEvent(id) {
        return this.get(`/events/${id}`);
    }

    // Volunteers
    async registerVolunteer(data) {
        return this.post('/volunteers', data);
    }

    // Donations
    async submitDonation(data) {
        return this.post('/donations', data);
    }

    // Content
    async getPageContent(pageName) {
        return this.get(`/admin/content/page-map/${pageName}`);
    }
}

/**
 * Admin API Client (requires authentication)
 */
class AdminAPIClient extends APIClient {
    constructor(authToken = null) {
        super();
        if (authToken) {
            this.setToken(authToken);
        }
    }

    // Authentication
    async login(username, password) {
        const response = await this.post('/admin/auth/login', { username, password });
        if (response.token) {
            this.setToken(response.token);
        }
        return response;
    }

    async validateToken() {
        return this.get('/admin/auth/validate');
    }

    // Content Management
    async updateContent(contentKey, contentValue, pageName) {
        return this.post('/admin/content/update', {
            contentKey,
            contentValue,
            pageName
        });
    }

    async batchUpdateContent(contents) {
        return this.post('/admin/content/batch-update', { contents });
    }

    async deleteContent(contentKey) {
        return this.delete(`/admin/content/${contentKey}`);
    }

    // Image Management
    async uploadImage(file, imageKey, pageName, altText, description) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('imageKey', imageKey);
        formData.append('pageName', pageName);
        if (altText) formData.append('altText', altText);
        if (description) formData.append('description', description);

        return this.uploadFile('/admin/images/upload', formData);
    }

    async deleteImage(imageKey) {
        return this.delete(`/admin/images/${imageKey}`);
    }
}

// ============================================================
// GLOBAL INSTANCES
// ============================================================

// Export for use in other scripts
const publicAPI = new PublicAPIClient();
const adminAPI = new AdminAPIClient();

// For backward compatibility with existing code
function fetchAPI(endpoint, options = {}) {
    return publicAPI.request(endpoint, options);
}
