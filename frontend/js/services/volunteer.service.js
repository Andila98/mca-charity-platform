/**
 * Volunteer Service
 * Handles all volunteer-related API operations
 */

class VolunteerService {
    constructor() {
        this.api = apiService;
        this.endpoints = API_CONFIG.ENDPOINTS.VOLUNTEERS;
    }

    /**
     * Register new volunteer
     * @param {object} volunteerData - Volunteer registration data
     * @returns {Promise<object>} Created volunteer
     */
    async register(volunteerData) {
        try {
            const response = await this.api.post(this.endpoints.BASE, volunteerData);
            console.log('✅ Volunteer registered successfully');
            return response;
        } catch (error) {
            console.error('❌ Volunteer registration failed:', error.message);
            throw error;
        }
    }

    /**
     * Get all volunteers
     * @returns {Promise<array>} List of volunteers
     */
    async getAll() {
        try {
            return await this.api.get(this.endpoints.BASE);
        } catch (error) {
            console.error('❌ Failed to fetch volunteers:', error.message);
            throw error;
        }
    }

    /**
     * Get volunteer by ID
     * @param {number} id - Volunteer ID
     * @returns {Promise<object>} Volunteer data
     */
    async getById(id) {
        try {
            return await this.api.get(this.endpoints.BY_ID(id));
        } catch (error) {
            console.error(`❌ Failed to fetch volunteer ${id}:`, error.message);
            throw error;
        }
    }

    /**
     * Get volunteers by status
     * @param {string} status - Status (ACTIVE, INACTIVE, SUSPENDED)
     * @returns {Promise<array>} List of volunteers
     */
    async getByStatus(status) {
        try {
            return await this.api.get(this.endpoints.BY_STATUS(status));
        } catch (error) {
            console.error(`❌ Failed to fetch volunteers by status ${status}:`, error.message);
            throw error;
        }
    }

    /**
     * Get volunteers by ward
     * @param {string} ward - Ward name
     * @returns {Promise<array>} List of volunteers
     */
    async getByWard(ward) {
        try {
            return await this.api.get(this.endpoints.BY_WARD(ward));
        } catch (error) {
            console.error(`❌ Failed to fetch volunteers by ward ${ward}:`, error.message);
            throw error;
        }
    }

    /**
     * Get volunteers by interest
     * @param {string} interest - Interest area
     * @returns {Promise<array>} List of volunteers
     */
    async getByInterest(interest) {
        try {
            return await this.api.get(this.endpoints.BY_INTEREST(interest));
        } catch (error) {
            console.error(`❌ Failed to fetch volunteers by interest ${interest}:`, error.message);
            throw error;
        }
    }

    /**
     * Update volunteer
     * @param {number} id - Volunteer ID
     * @param {object} updateData - Updated volunteer data
     * @returns {Promise<object>} Updated volunteer
     */
    async update(id, updateData) {
        try {
            const response = await this.api.put(this.endpoints.BY_ID(id), updateData);
            console.log(`✅ Volunteer ${id} updated successfully`);
            return response;
        } catch (error) {
            console.error(`❌ Failed to update volunteer ${id}:`, error.message);
            throw error;
        }
    }

    /**
     * Suspend/delete volunteer
     * @param {number} id - Volunteer ID
     * @returns {Promise<object>} Response
     */
    async suspend(id) {
        try {
            const response = await this.api.delete(this.endpoints.BY_ID(id));
            console.log(`✅ Volunteer ${id} suspended successfully`);
            return response;
        } catch (error) {
            console.error(`❌ Failed to suspend volunteer ${id}:`, error.message);
            throw error;
        }
    }

    /**
     * Get active volunteers count
     * @returns {Promise<number>} Count of active volunteers
     */
    async getActiveCount() {
        try {
            const volunteers = await this.getByStatus('ACTIVE');
            return volunteers.length;
        } catch (error) {
            console.error('❌ Failed to get active volunteer count:', error.message);
            return 0;
        }
    }
}

// Create singleton instance
const volunteerService = new VolunteerService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VolunteerService, volunteerService };
}