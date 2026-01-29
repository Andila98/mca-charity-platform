/**
 * Project Service
 * Handles charity project operations
 */

class ProjectService {
    /**
     * Create new project
     */
    static async create(projectData) {
        try {
            const response = await apiService.post(API_CONFIG.ENDPOINTS.PROJECTS.BASE, projectData);
            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get all projects
     */
    static async getAll() {
        try {
            const response = await apiService.get(API_CONFIG.ENDPOINTS.PROJECTS.BASE);
            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get project by ID
     */
    static async getById(id) {
        try {
            const response = await apiService.get(API_CONFIG.ENDPOINTS.PROJECTS.BY_ID(id));
            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get projects by status
     */
    static async getByStatus(status) {
        try {
            const response = await apiService.get(API_CONFIG.ENDPOINTS.PROJECTS.BY_STATUS(status));
            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get projects by ward
     */
    static async getByWard(ward) {
        try {
            const response = await apiService.get(API_CONFIG.ENDPOINTS.PROJECTS.BY_WARD(ward));
            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get top impact projects
     */
    static async getTopImpact() {
        try {
            const response = await apiService.get(API_CONFIG.ENDPOINTS.PROJECTS.TOP_IMPACT);
            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get projects by date range
     */
    static async getByDateRange(startDate, endDate) {
        try {
            const response = await apiService.get(API_CONFIG.ENDPOINTS.PROJECTS.DATE_RANGE, {
                startDate,
                endDate
            });
            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update project
     */
    static async update(id, projectData) {
        try {
            const response = await apiService.put(API_CONFIG.ENDPOINTS.PROJECTS.BY_ID(id), projectData);
            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete project
     */
    static async delete(id) {
        try {
            const response = await apiService.delete(API_CONFIG.ENDPOINTS.PROJECTS.BY_ID(id));
            return response;
        } catch (error) {
            throw error;
        }
    }
}