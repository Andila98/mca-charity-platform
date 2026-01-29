/**
 * Image Manager Service
 * Handles uploading, deleting, and retrieving images via the API client.
 */
class ImageManager {
    constructor(apiClient) {
        if (!apiClient) {
            throw new Error('API Client is required for ImageManager');
        }
        this.apiClient = apiClient;
        this.uploadProgress = {};
    }

    /**
     * Upload image file
     */
    async uploadImage(file, imageKey, pageName, altText = '', description = '', progressCallback = null) {
        if (!this.apiClient.authToken) {
            throw new Error('Not authenticated. Please login first.');
        }

        if (!file) {
            throw new Error('No file provided');
        }

        if (!imageKey || !pageName) {
            throw new Error('Image key and page name are required');
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error('File size exceeds 5MB limit');
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('Invalid file type. Allowed: JPEG, PNG, GIF, WebP');
        }

        try {
            // Create form data
            const formData = new FormData();
            formData.append('file', file);
            formData.append('imageKey', imageKey);
            formData.append('pageName', pageName);
            formData.append('altText', altText);
            formData.append('description', description);

            // Upload with progress tracking
            const response = await this._uploadWithProgress(formData, imageKey, progressCallback);

            if (!response.success) {
                throw new Error(response.message || 'Upload failed');
            }

            console.log(`✅ Image uploaded: ${imageKey}`);
            return response.image;

        } catch (error) {
            console.error('❌ Image upload error:', error);
            throw error;
        }
    }

    /**
     * Upload file with progress tracking using XHR
     * @private
     */
    _uploadWithProgress(formData, imageKey, progressCallback) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            // Track upload progress
            if (xhr.upload) {
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const percentComplete = (e.loaded / e.total) * 100;
                        this.uploadProgress[imageKey] = percentComplete;

                        if (progressCallback) {
                            progressCallback(percentComplete);
                        }
                    }
                });
            }

            // Handle completion
            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                } else {
                    let error = { message: 'Upload failed' };
                    try { error = JSON.parse(xhr.responseText); } catch (e) {}
                    reject(new Error(error.message || 'Upload failed'));
                }
            });

            // Handle error
            xhr.addEventListener('error', () => {
                reject(new Error('Network error during upload'));
            });

            xhr.addEventListener('abort', () => {
                reject(new Error('Upload cancelled'));
            });

            // Setup request
            // We assume the apiClient base URL ends with /api/v1, so we construct the upload URL accordingly
            // If apiClient.baseURL is 'http://localhost:8080/api/v1', we append '/admin/images/upload'
            // Note: The original code used /admin/images/upload relative to apiBase.
            // Let's assume the endpoint is /admin/images/upload relative to the API root.

            const uploadUrl = `${this.apiClient.baseURL}/admin/images/upload`;
            xhr.open('POST', uploadUrl);

            // Set Authorization header
            if (this.apiClient.authToken) {
                xhr.setRequestHeader('Authorization', `Bearer ${this.apiClient.authToken}`);
            }

            // Send
            xhr.send(formData);
        });
    }

    /**
     * Get image by key
     */
    async getImage(imageKey) {
        try {
            return await this.apiClient.get(`/admin/images/${imageKey}`);
        } catch (error) {
            console.error('❌ Error loading image:', error);
            throw error;
        }
    }

    /**
     * Get all active images for a page
     */
    async getPageImages(pageName) {
        try {
            const data = await this.apiClient.get(`/admin/images/page/${pageName}`);
            console.log(`✅ Loaded ${data.count || (data.images || []).length} images for page: ${pageName}`);
            return data.images || [];
        } catch (error) {
            console.error('❌ Error loading page images:', error);
            return [];
        }
    }

    /**
     * Delete image
     */
    async deleteImage(imageKey) {
        try {
            const data = await this.apiClient.delete(`/admin/images/${imageKey}`);
            console.log(`✅ Image deleted: ${imageKey}`);
            return data;
        } catch (error) {
            console.error('❌ Delete error:', error);
            throw error;
        }
    }

    /**
     * Update image metadata (alt text, description)
     */
    async updateImageMetadata(imageKey, altText, description) {
        try {
            const params = new URLSearchParams();
            if (altText) params.append('altText', altText);
            if (description) params.append('description', description);

            const data = await this.apiClient.patch(`/admin/images/${imageKey}?${params.toString()}`, {});
            console.log(`✅ Image metadata updated: ${imageKey}`);
            return data;
        } catch (error) {
            console.error('❌ Update error:', error);
            throw error;
        }
    }

    /**
     * Get storage usage stats
     */
    async getStorageStats() {
        try {
            return await this.apiClient.get('/admin/images/stats/storage');
        } catch (error) {
            console.error('Error getting storage stats:', error);
            return null;
        }
    }

    /**
     * Get upload progress for an image
     */
    getUploadProgress(imageKey) {
        return this.uploadProgress[imageKey] || 0;
    }

    /**
     * Cancel upload (not fully implemented)
     */
    cancelUpload(imageKey) {
        delete this.uploadProgress[imageKey];
    }
}
