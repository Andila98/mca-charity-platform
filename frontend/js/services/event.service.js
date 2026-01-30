/**
 * Event Service
 * Handles event operations
 */

class EventService {
    /**
     * Create new event
     */
    static async create(eventData) {
        try {
            const response = await apiService.post(API_CONFIG.ENDPOINTS.EVENTS.BASE, eventData);
            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get all events
     */
    static async getAll() {
        try {
            const response = await apiService.get(API_CONFIG.ENDPOINTS.EVENTS.BASE);
            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get event by ID
     */
    static async getById(id) {
        try {
            const response = await apiService.get(API_CONFIG.ENDPOINTS.EVENTS.BY_ID(id));
            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get upcoming events
     */
    static async getUpcoming() {
        try {
            const response = await apiService.get(API_CONFIG.ENDPOINTS.EVENTS.UPCOMING);
            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get events by project
     */
    static async getByProject(projectId) {
        try {
            const response = await apiService.get(API_CONFIG.ENDPOINTS.EVENTS.BY_PROJECT(projectId));
            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Register volunteer for event
     */
    static async registerVolunteer(eventId, volunteerId) {
        try {
            const response = await apiService.post(API_CONFIG.ENDPOINTS.EVENTS.REGISTER_VOLUNTEER(eventId, volunteerId));
            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update event
     */
    static async update(id, eventData) {
        try {
            const response = await apiService.put(API_CONFIG.ENDPOINTS.EVENTS.BY_ID(id), eventData);
            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete event
     */
    static async delete(id) {
        try {
            const response = await apiService.delete(API_CONFIG.ENDPOINTS.EVENTS.BY_ID(id));
            return response;
        } catch (error) {
            throw error;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EventService };
}