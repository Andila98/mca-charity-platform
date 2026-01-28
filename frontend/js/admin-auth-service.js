/**
 * Admin Authentication Service
 * Handles login, logout, and token management
 */
class AdminAuthService {
    constructor(apiBase = 'http://localhost:8080/api') {
        this.apiBase = apiBase;
        this.token = this.loadToken();
        this.username = this.loadUsername();
        this.isLoggedIn = !!this.token;
    }

    /**
     * Attempt to login with credentials
     * @param {string} username - Admin username
     * @param {string} password - Admin password
     * @returns {Promise<Object>} Login response with token
     */
    async login(username, password) {
        if (!username || !password) {
            throw new Error('Username and password are required');
        }

        try {
            const response = await fetch(`${this.apiBase}/admin/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const data = await response.json();
            
            // Store token and username
            this.token = data.token;
            this.username = data.username;
            this.isLoggedIn = true;

            // Persist to localStorage
            localStorage.setItem('admin_token', this.token);
            localStorage.setItem('admin_username', this.username);
            localStorage.setItem('admin_login_time', new Date().toISOString());

            console.log('✅ Admin login successful:', this.username);
            return data;

        } catch (error) {
            console.error('❌ Login error:', error.message);
            throw error;
        }
    }

    /**
     * Validate if current token is still valid
     * @returns {Promise<boolean>} True if token is valid
     */
    async validateToken() {
        if (!this.token) {
            return false;
        }

        try {
            const response = await fetch(`${this.apiBase}/admin/auth/validate`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.ok;
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    }

    /**
     * Logout admin user
     */
    logout() {
        this.token = null;
        this.username = null;
        this.isLoggedIn = false;

        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_username');
        localStorage.removeItem('admin_login_time');

        console.log('👋 Admin logged out');
    }

    /**
     * Check if user is logged in
     * @returns {boolean}
     */
    isAuthenticated() {
        return this.isLoggedIn && !!this.token;
    }

    /**
     * Get current admin username
     * @returns {string|null}
     */
    getUsername() {
        return this.username;
    }

    /**
     * Get auth token
     * @returns {string|null}
     */
    getToken() {
        return this.token;
    }

    /**
     * Get Authorization header for API requests
     * @returns {Object}
     */
    getAuthHeader() {
        return {
            'Authorization': `Bearer ${this.token}`
        };
    }

    /**
     * Load token from localStorage
     * @private
     */
    loadToken() {
        return localStorage.getItem('admin_token');
    }

    /**
     * Load username from localStorage
     * @private
     */
    loadUsername() {
        return localStorage.getItem('admin_username');
    }
}