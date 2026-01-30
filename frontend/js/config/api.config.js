**
 * API Configuration
 * Central configuration for all API endpoints
 */

const API_CONFIG = {
    // Base configuration
    BASE_URL: 'http://localhost:8080/api',
    VERSION: 'v1',
    TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second

    // Endpoint definitions
    ENDPOINTS: {
        // Authentication
        AUTH: {
            REGISTER: '/auth/register',
            LOGIN: '/auth/login'
        },
        
        // Admin Authentication
        ADMIN_AUTH: {
            LOGIN: '/admin/auth/login',
            VALIDATE: '/admin/auth/validate'
        },
        
        // Users
        USERS: {
            BASE: '/users',
            BY_ID: (id) => `/users/${id}`,
            BY_EMAIL: (email) => `/users/email/${email}`,
            UNAPPROVED: '/users/unapproved',
            APPROVE: (id) => `/users/${id}/approve`
        },
        
        // Volunteers
        VOLUNTEERS: {
            BASE: '/volunteers',
            BY_ID: (id) => `/volunteers/${id}`,
            BY_STATUS: (status) => `/volunteers/status/${status}`,
            BY_WARD: (ward) => `/volunteers/ward/${ward}`,
            BY_INTEREST: (interest) => `/volunteers/interest/${interest}`
        },
        
        // Projects
        PROJECTS: {
            BASE: '/projects',
            BY_ID: (id) => `/projects/${id}`,
            BY_STATUS: (status) => `/projects/status/${status}`,
            BY_WARD: (ward) => `/projects/ward/${ward}`,
            BY_CREATOR: (userId) => `/projects/creator/${userId}`,
            TOP_IMPACT: '/projects/top-impact'
        },
        
        // Events
        EVENTS: {
            BASE: '/events',
            BY_ID: (id) => `/events/${id}`,
            UPCOMING: '/events/upcoming',
            BY_STATUS: (status) => `/events/status/${status}`,
            BY_PROJECT: (projectId) => `/events/project/${projectId}`,
            REGISTER_VOLUNTEER: (eventId, volunteerId) => 
                `/events/${eventId}/register/${volunteerId}`
        },
        
        // Donations
        DONATIONS: {
            BASE: '/donations',
            BY_ID: (id) => `/donations/${id}`,
            BY_STATUS: (status) => `/donations/status/${status}`,
            BY_PROJECT: (projectId) => `/donations/project/${projectId}`,
            PROJECT_TOTAL: (projectId) => `/donations/project/${projectId}/total`
        },
        
        // Admin Content Management
        ADMIN_CONTENT: {
            UPDATE: '/admin/content/update',
            BATCH_UPDATE: '/admin/content/batch-update',
            BY_KEY: (key) => `/admin/content/${key}`,
            BY_PAGE: (pageName) => `/admin/content/page/${pageName}`,
            PAGE_MAP: (pageName) => `/admin/content/page-map/${pageName}`,
            RECENT_UPDATES: '/admin/content/recent/updates'
        },
        
        // Admin Image Management
        ADMIN_IMAGES: {
            UPLOAD: '/admin/images/upload',
            BY_KEY: (key) => `/admin/images/${key}`,
            BY_PAGE: (pageName) => `/admin/images/page/${pageName}`,
            RECENT_UPLOADS: '/admin/images/recent/uploads',
            STORAGE_STATS: '/admin/images/stats/storage'
        }
    }
};

/**
 * Get full API URL
 * @param {string} endpoint - Endpoint path
 * @returns {string} Full URL
 */
function getFullURL(endpoint) {
    return `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}${endpoint}`;
}

/**
 * Get environment-specific API URL
 * @returns {string} API base URL
 */
function getAPIBaseURL() {
    // Check if we're in development, staging, or production
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:8080/api';
    } else if (hostname.includes('staging')) {
        return 'https://api-staging.ajelofoundation.org/api';
    } else {
        return 'https://api.ajelofoundation.org/api';
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, getFullURL, getAPIBaseURL };
}