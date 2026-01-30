/**
 * Content Manager Service
 * Handles saving and loading page content via the API client.
 */
class ContentManager {
    constructor(apiClient) {
        if (!apiClient) {
            throw new Error('API Client is required for ContentManager');
        }
        this.apiClient = apiClient;
        this.contentCache = {};
        this.isDirty = false;
    }

    /**
     * Update single content item on backend
     */
    async updateContent(contentKey, contentValue, pageName = 'landing') {
        if (!contentKey || !contentValue) {
            throw new Error('Content key and value are required');
        }

        try {
            const data = await this.apiClient.updateContent(contentKey, contentValue, pageName);
            this.contentCache[contentKey] = contentValue;
            this.isDirty = false;
            console.log(`✅ Content updated: ${contentKey}`);
            return data;
        } catch (error) {
            console.error('❌ Content update error:', error);
            throw error;
        }
    }

    /**
     * Update multiple content items in one request
     */
    async batchUpdateContent(updates) {
        if (!Array.isArray(updates) || updates.length === 0) {
            throw new Error('Updates array cannot be empty');
        }

        try {
            const data = await this.apiClient.batchUpdateContent(updates);

            // Update cache
            updates.forEach(update => {
                this.contentCache[update.contentKey] = update.contentValue;
            });
            this.isDirty = false;

            console.log(`✅ Batch update completed: ${updates.length} items`);
            return data;
        } catch (error) {
            console.error('❌ Batch update error:', error);
            throw error;
        }
    }

    /**
     * Load all content for a page from backend
     */
    async loadPageContent(pageName = 'landing') {
        try {
            const contentMap = await this.apiClient.getPageContent(pageName) || {};

            // Update cache
            Object.assign(this.contentCache, contentMap);
            console.log(`✅ Loaded ${Object.keys(contentMap).length} content items for page: ${pageName}`);
            return contentMap;
        } catch (error) {
            console.error('❌ Error loading page content:', error);
            return {};
        }
    }

    /**
     * Get single content item from backend
     */
    async getContent(contentKey) {
        try {
            // Assuming the API client has a generic get method or we add a specific one
            // Since AdminAPIClient doesn't expose a generic 'get', we might need to add it or use request
            // However, looking at api.service.js, AdminAPIClient inherits from APIClient which has get()
            const data = await this.apiClient.get(`/admin/content/${contentKey}`);
            this.contentCache[contentKey] = data.contentValue;
            return data;
        } catch (error) {
            console.error('❌ Error loading content:', error);
            throw error;
        }
    }

    /**
     * Delete content from backend
     */
    async deleteContent(contentKey) {
        try {
            const data = await this.apiClient.deleteContent(contentKey);
            delete this.contentCache[contentKey];
            console.log(`✅ Content deleted: ${contentKey}`);
            return data;
        } catch (error) {
            console.error('❌ Content delete error:', error);
            throw error;
        }
    }

    /**
     * Check if there are unsaved changes
     */
    hasUnsavedChanges() {
        return this.isDirty;
    }

    /**
     * Mark changes as dirty (unsaved)
     */
    markDirty() {
        this.isDirty = true;
    }

    /**
     * Clear dirty flag
     */
    clearDirty() {
        this.isDirty = false;
    }

    /**
     * Get all cached content
     */
    getCachedContent() {
        return { ...this.contentCache };
    }

    /**
     * Clear content cache
     */
    clearCache() {
        this.contentCache = {};
    }
}
