/**
 * Donation Service
 * Handles all donation-related API operations
 */

class DonationService {
    constructor() {
        this.api = apiService;
        this.endpoints = API_CONFIG.ENDPOINTS.DONATIONS;
    }

    /**
     * Record new donation
     * @param {object} donationData - Donation data
     * @returns {Promise<object>} Created donation
     */
    async create(donationData) {
        try {
            // Validate donation data
            this.validateDonation(donationData);

            const response = await this.api.post(this.endpoints.BASE, donationData);
            console.log('✅ Donation recorded successfully');
            return response;
        } catch (error) {
            console.error('❌ Donation recording failed:', error.message);
            throw error;
        }
    }

    /**
     * Get all donations
     * @returns {Promise<array>} List of donations
     */
    async getAll() {
        try {
            return await this.api.get(this.endpoints.BASE);
        } catch (error) {
            console.error('❌ Failed to fetch donations:', error.message);
            throw error;
        }
    }

    /**
     * Get donation by ID
     * @param {number} id - Donation ID
     * @returns {Promise<object>} Donation data
     */
    async getById(id) {
        try {
            return await this.api.get(this.endpoints.BY_ID(id));
        } catch (error) {
            console.error(`❌ Failed to fetch donation ${id}:`, error.message);
            throw error;
        }
    }

    /**
     * Get donations by status
     * @param {string} status - Status (PENDING, RECEIVED, USED)
     * @returns {Promise<array>} List of donations
     */
    async getByStatus(status) {
        try {
            return await this.api.get(this.endpoints.BY_STATUS(status));
        } catch (error) {
            console.error(`❌ Failed to fetch donations by status ${status}:`, error.message);
            throw error;
        }
    }

    /**
     * Get donations for a project
     * @param {number} projectId - Project ID
     * @returns {Promise<array>} List of donations
     */
    async getByProject(projectId) {
        try {
            return await this.api.get(this.endpoints.BY_PROJECT(projectId));
        } catch (error) {
            console.error(`❌ Failed to fetch donations for project ${projectId}:`, error.message);
            throw error;
        }
    }

    /**
     * Get total donations for a project
     * @param {number} projectId - Project ID
     * @returns {Promise<number>} Total donation amount
     */
    async getTotalForProject(projectId) {
        try {
            const response = await this.api.get(this.endpoints.PROJECT_TOTAL(projectId));
            return response || 0;
        } catch (error) {
            console.error(`❌ Failed to fetch total donations for project ${projectId}:`, error.message);
            return 0;
        }
    }

    /**
     * Update donation
     * @param {number} id - Donation ID
     * @param {object} updateData - Updated donation data
     * @returns {Promise<object>} Updated donation
     */
    async update(id, updateData) {
        try {
            const response = await this.api.put(this.endpoints.BY_ID(id), updateData);
            console.log(`✅ Donation ${id} updated successfully`);
            return response;
        } catch (error) {
            console.error(`❌ Failed to update donation ${id}:`, error.message);
            throw error;
        }
    }

    /**
     * Delete donation
     * @param {number} id - Donation ID
     * @returns {Promise<object>} Response
     */
    async delete(id) {
        try {
            const response = await this.api.delete(this.endpoints.BY_ID(id));
            console.log(`✅ Donation ${id} deleted successfully`);
            return response;
        } catch (error) {
            console.error(`❌ Failed to delete donation ${id}:`, error.message);
            throw error;
        }
    }

    /**
     * Get total donations count
     * @returns {Promise<number>} Total donation count
     */
    async getTotalCount() {
        try {
            const donations = await this.getAll();
            return donations.length;
        } catch (error) {
            console.error('❌ Failed to get donation count:', error.message);
            return 0;
        }
    }

    /**
     * Get total amount donated
     * @returns {Promise<number>} Total amount
     */
    async getTotalAmount() {
        try {
            const donations = await this.getByStatus('RECEIVED');
            return donations.reduce((sum, donation) => sum + (donation.amount || 0), 0);
        } catch (error) {
            console.error('❌ Failed to get total donation amount:', error.message);
            return 0;
        }
    }

    /**
     * Validate donation data
     * @param {object} donationData - Donation data to validate
     * @private
     */
    validateDonation(donationData) {
        // Required fields
        if (!donationData.donorName || !donationData.donorName.trim()) {
            throw new Error('Donor name is required');
        }

        if (!donationData.donationType) {
            throw new Error('Donation type is required');
        }

        // For CASH donations, amount is required
        if (donationData.donationType === 'CASH') {
            if (!donationData.amount || donationData.amount <= 0) {
                throw new Error('Valid donation amount is required for cash donations');
            }
        }

        // For ITEM/SERVICE donations, description is helpful
        if ((donationData.donationType === 'ITEM' || donationData.donationType === 'SERVICE')
            && !donationData.itemDescription) {
            console.warn('⚠️ Item description is recommended for non-cash donations');
        }

        // Validate email if provided
        if (donationData.donorEmail && !ValidationUtil.email(donationData.donorEmail)) {
            throw new Error('Invalid email format');
        }

        // Validate phone if provided
        if (donationData.donorPhone && !ValidationUtil.phone(donationData.donorPhone)) {
            throw new Error('Invalid phone number format');
        }
    }
}

// Create singleton instance
const donationService = new DonationService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DonationService, donationService };
}