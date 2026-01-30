/**
 * Admin Authentication Service
 * A wrapper around the AdminAPIClient to manage session state.
 */
class AdminAuthService {
    constructor(adminApiClient) {
        this.apiClient = adminApiClient;
        this.username = localStorage.getItem('admin_username');
    }

    /**
     * Attempt to login with credentials.
     * On success, the token is managed internally by the apiClient.
     */
    async login(username, password) {
        const response = await this.apiClient.login(username, password);
        this.username = username; // Or get from response if available
        localStorage.setItem('admin_username', this.username);
        localStorage.setItem('admin_login_time', new Date().toISOString());
        return response;
    }

    /**
     * Validate if the current token is still valid.
     */
    async validateToken() {
        if (!this.apiClient.authToken) {
            return false;
        }
        try {
            await this.apiClient.validateToken();
            return true;
        } catch (error) {
            console.error('Token validation failed:', error);
            return false;
        }
    }

    /**
     * Logout admin user.
     */
    logout() {
        this.apiClient.clearToken(); // clearToken also removes from localStorage
        localStorage.removeItem('admin_username');
        localStorage.removeItem('admin_login_time');
        this.username = null;
        console.log('👋 Admin logged out');
    }

    /**
     * Check if user is logged in.
     */
    isAuthenticated() {
        return !!this.apiClient.authToken;
    }

    /**
     * Get current admin username.
     */
    getUsername() {
        return this.username;
    }

    /**
     * Get auth token.
     */
    getToken() {
        return this.apiClient.authToken;
    }
}
