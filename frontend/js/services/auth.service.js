/**
 * Authentication Service
 * Handles user registration, login, logout, and session management
 */

class AuthService {
    constructor() {
        this.api = apiService;
        this.currentUser = null;
        this.TOKEN_KEY = 'auth_token';
        this.ADMIN_TOKEN_KEY = 'admin_auth_token';
        this.USER_KEY = 'user_data';
    }

    /**
     * Register new user
     * @param {object} userData - User registration data
     * @returns {Promise<object>} Registration response
     */
    async register(userData) {
        try {
            // Validate required fields
            this.validateRegistration(userData);

            const response = await this.api.post(
                API_CONFIG.ENDPOINTS.AUTH.REGISTER,
                userData
            );

            console.log('✅ Registration successful');
            return response;

        } catch (error) {
            console.error('❌ Registration failed:', error.message);
            throw new Error(`Registration failed: ${error.message}`);
        }
    }

    /**
     * Login user
     * @param {object} credentials - Login credentials
     * @returns {Promise<object>} Login response with token
     */
    async login(credentials) {
        try {
            // Validate credentials
            if (!credentials.email || !credentials.password) {
                throw new Error('Email and password are required');
            }

            const response = await this.api.post(
                API_CONFIG.ENDPOINTS.AUTH.LOGIN,
                credentials
            );

            // Store authentication data
            this.storeAuthData(response, false);

            console.log('✅ Login successful:', response.email);
            return response;

        } catch (error) {
            console.error('❌ Login failed:', error.message);
            throw new Error(`Login failed: ${error.message}`);
        }
    }

    /**
     * Login admin user
     * @param {object} credentials - Login credentials
     * @returns {Promise<object>} Login response with token
     */
    async adminLogin(credentials) {
        try {
            // Validate credentials
            if (!credentials.email || !credentials.password) {
                throw new Error('Email and password are required');
            }

            const response = await this.api.post(
                API_CONFIG.ENDPOINTS.ADMIN_AUTH.LOGIN,
                credentials
            );

            // Store authentication data
            this.storeAuthData(response, true);

            console.log('✅ Admin login successful:', response.email);
            return response;

        } catch (error) {
            console.error('❌ Admin login failed:', error.message);
            throw new Error(`Admin login failed: ${error.message}`);
        }
    }

    /**
     * Logout user
     */
    logout() {
        // Clear all auth-related data
        StorageUtil.remove(this.TOKEN_KEY);
        StorageUtil.remove(this.ADMIN_TOKEN_KEY);
        StorageUtil.remove(this.USER_KEY);
        this.currentUser = null;

        console.log('👋 User logged out');

        // Redirect to home
        window.location.href = '/index.html';
    }

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }

    /**
     * Get current user data
     * @returns {object|null} User data or null
     */
    getCurrentUser() {
        if (!this.currentUser) {
            this.currentUser = StorageUtil.get(this.USER_KEY);
        }
        return this.currentUser;
    }

    /**
     * Get authentication token
     * @returns {string|null} JWT token or null
     */
    getToken() {
        return StorageUtil.get(this.ADMIN_TOKEN_KEY) || StorageUtil.get(this.TOKEN_KEY);
    }

    /**
     * Check if user has specific role
     * @param {string} role - Role to check
     * @returns {boolean}
     */
    hasRole(role) {
        const user = this.getCurrentUser();
        return user && user.role === role;
    }

    /**
     * Check if user is admin
     * @returns {boolean}
     */
    isAdmin() {
        return this.hasRole('ADMIN');
    }

    /**
     * Check if user is editor
     * @returns {boolean}
     */
    isEditor() {
        return this.hasRole('EDITOR') || this.isAdmin();
    }

    /**
     * Require authentication (redirect to login if not authenticated)
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            StorageUtil.set('redirect_after_login', window.location.pathname);
            const isAdminRoute = window.location.pathname.includes('/admin');
            window.location.href = isAdminRoute ? '/pages/admin/login.html' : '/login.html';
        }
    }

    /**
     * Require specific role (redirect if user doesn't have role)
     * @param {string} role - Required role
     */
    requireRole(role) {
        this.requireAuth();
        
        if (!this.hasRole(role)) {
            alert('You do not have permission to access this page');
            window.location.href = '/index.html';
        }
    }

    /**
     * Require admin role (redirect if user is not an admin)
     */
    requireAdmin() {
        this.requireRole('ADMIN');
    }

    /**
     * Handle redirect after login
     */
    handleLoginRedirect() {
        const redirect = StorageUtil.get('redirect_after_login');
        
        if (redirect) {
            StorageUtil.remove('redirect_after_login');
            window.location.href = redirect;
        } else {
            window.location.href = '/index.html';
        }
    }

    /**
     * Store authentication data
     * @param {object} authData - Authentication response
     * @param {boolean} isAdmin - Whether the login is for an admin
     * @private
     */
    storeAuthData(authData, isAdmin = false) {
        // Store token
        const tokenKey = isAdmin ? this.ADMIN_TOKEN_KEY : this.TOKEN_KEY;
        StorageUtil.set(tokenKey, authData.token);

        // Store user data
        const userData = {
            id: authData.id, // Store ID
            email: authData.email,
            fullName: authData.fullName,
            role: authData.role
        };
        StorageUtil.set(this.USER_KEY, userData);
        this.currentUser = userData;
    }

    /**
     * Validate registration data
     * @param {object} userData - User registration data
     * @private
     */
    validateRegistration(userData) {
        const required = ['email', 'password', 'fullName', 'phone', 'ward'];
        
        for (const field of required) {
            if (!userData[field]) {
                throw new Error(`${field} is required`);
            }
        }

        // Validate email format
        if (!ValidationUtil.email(userData.email)) {
            throw new Error('Invalid email format');
        }

        // Validate password length
        if (userData.password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }

        // Validate phone
        if (!ValidationUtil.phone(userData.phone)) {
            throw new Error('Invalid phone number');
        }
    }

    /**
     * Update user profile
     * @param {object} profileData - Profile update data
     * @returns {Promise<object>} Updated user data
     */
    async updateProfile(profileData) {
        try {
            const user = this.getCurrentUser();
            if (!user || !user.id) throw new Error('User not authenticated');

            // Call API to update profile using ID
            const response = await this.api.put(
                API_CONFIG.ENDPOINTS.USERS.BY_ID(user.id),
                profileData
            );

            // Update stored user data
            const updatedUser = { ...user, ...profileData };
            StorageUtil.set(this.USER_KEY, updatedUser);
            this.currentUser = updatedUser;

            console.log('✅ Profile updated successfully');
            return response;

        } catch (error) {
            console.error('❌ Profile update failed:', error.message);
            throw new Error(`Profile update failed: ${error.message}`);
        }
    }
}

// Create singleton instance
const authService = new AuthService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthService, authService };
}