/**
 * Content Manager Service
 * Handles saving and loading page content from backend
 */
class ContentManager {
    constructor(apiBase = 'http://localhost:8080/api', authService) {
        this.apiBase = apiBase;
        this.authService = authService;
        this.contentCache = {};
        this.isDirty = false;
    }

    /**
     * Update single content item on backend
     * @param {string} contentKey - Unique identifier for content
     * @param {string} contentValue - The new content value
     * @param {string} pageName - Page this content belongs to
     * @returns {Promise<Object>} Response from backend
     */
    async updateContent(contentKey, contentValue, pageName = 'landing') {

        if (!this.authService.isAuthenticated()) {
            throw new Error('Not authenticated. Please login first.');
        }

        if (!contentKey || !contentValue) {
            throw new Error('Content key and value are required');
        }

        try {
            const response = await fetch(`${this.apiBase}/admin/content/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authService.getToken()}`
                },
                body: JSON.stringify({
                    contentKey,
                    contentValue,
                    pageName
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `Update failed: ${response.status}`);
            }

            const data = await response.json();
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
     * @param {Array} updates - Array of {contentKey, contentValue, pageName}
     * @returns {Promise<Object>} Response from backend
     */
    async batchUpdateContent(updates) {

        if (!this.authService.isAuthenticated()) {
            throw new Error('Not authenticated. Please login first.');
        }

        if (!Array.isArray(updates) || updates.length === 0) {
            throw new Error('Updates array cannot be empty');
        }

        try {
            const response = await fetch(`${this.apiBase}/admin/content/batch-update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authService.getToken()}`
                },
                body: JSON.stringify({ contents: updates })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `Batch update failed: ${response.status}`);
            }

            const data = await response.json();

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
     * @param {string} pageName - Page to load content for
     * @returns {Promise<Object>} Content map {key: value}
     */
    async loadPageContent(pageName = 'landing') {
        try {
            const response = await fetch(`${this.apiBase}/admin/content/page-map/${pageName}`);

            if (!response.ok) {
                console.warn(`Could not load content for page: ${pageName}`);
                return {};
            }

            const contentMap = await response.json();

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
     * Get content for a page as array (with metadata)
     * @param {string} pageName - Page to load
     * @returns {Promise<Array>} Array of content items with metadata
     */
    async getPageContentWithMetadata(pageName = 'landing') {
        try {
            const response = await fetch(`${this.apiBase}/admin/content/page/${pageName}`);

            if (!response.ok) {
                console.warn(`Could not load content for page: ${pageName}`);
                return [];
            }

            const data = await response.json();
            console.log(`✅ Loaded content with metadata for page: ${pageName}`);

            return data.content || [];

        } catch (error) {
            console.error('❌ Error loading page content with metadata:', error);
            return [];
        }
    }

    /**
     * Get single content item from backend
     * @param {string} contentKey - Content key to retrieve
     * @returns {Promise<Object>} Content response
     */
    async getContent(contentKey) {
        try {
            const response = await fetch(`${this.apiBase}/admin/content/${contentKey}`);

            if (!response.ok) {
                throw new Error(`Content not found: ${contentKey}`);
            }

            const data = await response.json();
            this.contentCache[contentKey] = data.contentValue;

            return data;

        } catch (error) {
            console.error('❌ Error loading content:', error);
            throw error;
        }
    }

    /**
     * Delete content from backend
     * @param {string} contentKey - Content to delete
     * @returns {Promise<Object>} Response from backend
     */
    async deleteContent(contentKey) {

        if (!this.authService.isAuthenticated()) {
            throw new Error('Not authenticated. Please login first.');
        }

        try {
            const response = await fetch(`${this.apiBase}/admin/content/${contentKey}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.authService.getToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`Delete failed: ${response.status}`);
            }

            delete this.contentCache[contentKey];
            console.log(`✅ Content deleted: ${contentKey}`);

            return await response.json();

        } catch (error) {
            console.error('❌ Content delete error:', error);
            throw error;
        }
    }

    /**
     * Get recent updates across all pages
     * @returns {Promise<Array>} List of recent updates
     */
    async getRecentUpdates() {
        try {
            const response = await fetch(`${this.apiBase}/admin/content/recent/updates`);

            if (!response.ok) {
                return [];
            }

            return await response.json();

        } catch (error) {
            console.error('Error fetching recent updates:', error);
            return [];
        }
    }

    /**
     * Check if there are unsaved changes
     * @returns {boolean}
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
     * @returns {Object}
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
}/**
  * Content Manager Service
  * Handles saving and loading page content from backend
  */
 class ContentManager {
     constructor(apiBase = 'http://localhost:8080/api', authService) {
         this.apiBase = apiBase;
         this.authService = authService;
         this.contentCache = {};
         this.isDirty = false;
     }

     /**
      * Update single content item on backend
      * @param {string} contentKey - Unique identifier for content
      * @param {string} contentValue - The new content value
      * @param {string} pageName - Page this content belongs to
      * @returns {Promise<Object>} Response from backend
      */
     async updateContent(contentKey, contentValue, pageName = 'landing') {

         if (!this.authService.isAuthenticated()) {
             throw new Error('Not authenticated. Please login first.');
         }

         if (!contentKey || !contentValue) {
             throw new Error('Content key and value are required');
         }

         try {
             const response = await fetch(`${this.apiBase}/admin/content/update`, {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/json',
                     'Authorization': `Bearer ${this.authService.getToken()}`
                 },
                 body: JSON.stringify({
                     contentKey,
                     contentValue,
                     pageName
                 })
             });

             if (!response.ok) {
                 const error = await response.json();
                 throw new Error(error.message || `Update failed: ${response.status}`);
             }

             const data = await response.json();
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
      * @param {Array} updates - Array of {contentKey, contentValue, pageName}
      * @returns {Promise<Object>} Response from backend
      */
     async batchUpdateContent(updates) {

         if (!this.authService.isAuthenticated()) {
             throw new Error('Not authenticated. Please login first.');
         }

         if (!Array.isArray(updates) || updates.length === 0) {
             throw new Error('Updates array cannot be empty');
         }

         try {
             const response = await fetch(`${this.apiBase}/admin/content/batch-update`, {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/json',
                     'Authorization': `Bearer ${this.authService.getToken()}`
                 },
                 body: JSON.stringify({ contents: updates })
             });

             if (!response.ok) {
                 const error = await response.json();
                 throw new Error(error.message || `Batch update failed: ${response.status}`);
             }

             const data = await response.json();

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
      * @param {string} pageName - Page to load content for
      * @returns {Promise<Object>} Content map {key: value}
      */
     async loadPageContent(pageName = 'landing') {
         try {
             const response = await fetch(`${this.apiBase}/admin/content/page-map/${pageName}`);

             if (!response.ok) {
                 console.warn(`Could not load content for page: ${pageName}`);
                 return {};
             }

             const contentMap = await response.json();

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
      * Get content for a page as array (with metadata)
      * @param {string} pageName - Page to load
      * @returns {Promise<Array>} Array of content items with metadata
      */
     async getPageContentWithMetadata(pageName = 'landing') {
         try {
             const response = await fetch(`${this.apiBase}/admin/content/page/${pageName}`);

             if (!response.ok) {
                 console.warn(`Could not load content for page: ${pageName}`);
                 return [];
             }

             const data = await response.json();
             console.log(`✅ Loaded content with metadata for page: ${pageName}`);

             return data.content || [];

         } catch (error) {
             console.error('❌ Error loading page content with metadata:', error);
             return [];
         }
     }

     /**
      * Get single content item from backend
      * @param {string} contentKey - Content key to retrieve
      * @returns {Promise<Object>} Content response
      */
     async getContent(contentKey) {
         try {
             const response = await fetch(`${this.apiBase}/admin/content/${contentKey}`);

             if (!response.ok) {
                 throw new Error(`Content not found: ${contentKey}`);
             }

             const data = await response.json();
             this.contentCache[contentKey] = data.contentValue;

             return data;

         } catch (error) {
             console.error('❌ Error loading content:', error);
             throw error;
         }
     }

     /**
      * Delete content from backend
      * @param {string} contentKey - Content to delete
      * @returns {Promise<Object>} Response from backend
      */
     async deleteContent(contentKey) {

         if (!this.authService.isAuthenticated()) {
             throw new Error('Not authenticated. Please login first.');
         }

         try {
             const response = await fetch(`${this.apiBase}/admin/content/${contentKey}`, {
                 method: 'DELETE',
                 headers: {
                     'Authorization': `Bearer ${this.authService.getToken()}`
                 }
             });

             if (!response.ok) {
                 throw new Error(`Delete failed: ${response.status}`);
             }

             delete this.contentCache[contentKey];
             console.log(`✅ Content deleted: ${contentKey}`);

             return await response.json();

         } catch (error) {
             console.error('❌ Content delete error:', error);
             throw error;
         }
     }

     /**
      * Get recent updates across all pages
      * @returns {Promise<Array>} List of recent updates
      */
     async getRecentUpdates() {
         try {
             const response = await fetch(`${this.apiBase}/admin/content/recent/updates`);

             if (!response.ok) {
                 return [];
             }

             return await response.json();

         } catch (error) {
             console.error('Error fetching recent updates:', error);
             return [];
         }
     }

     /**
      * Check if there are unsaved changes
      * @returns {boolean}
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
      * @returns {Object}
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
 }/**
   * Content Manager Service
   * Handles saving and loading page content from backend
   */
  class ContentManager {
      constructor(apiBase = 'http://localhost:8080/api', authService) {
          this.apiBase = apiBase;
          this.authService = authService;
          this.contentCache = {};
          this.isDirty = false;
      }

      /**
       * Update single content item on backend
       * @param {string} contentKey - Unique identifier for content
       * @param {string} contentValue - The new content value
       * @param {string} pageName - Page this content belongs to
       * @returns {Promise<Object>} Response from backend
       */
      async updateContent(contentKey, contentValue, pageName = 'landing') {

          if (!this.authService.isAuthenticated()) {
              throw new Error('Not authenticated. Please login first.');
          }

          if (!contentKey || !contentValue) {
              throw new Error('Content key and value are required');
          }

          try {
              const response = await fetch(`${this.apiBase}/admin/content/update`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${this.authService.getToken()}`
                  },
                  body: JSON.stringify({
                      contentKey,
                      contentValue,
                      pageName
                  })
              });

              if (!response.ok) {
                  const error = await response.json();
                  throw new Error(error.message || `Update failed: ${response.status}`);
              }

              const data = await response.json();
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
       * @param {Array} updates - Array of {contentKey, contentValue, pageName}
       * @returns {Promise<Object>} Response from backend
       */
      async batchUpdateContent(updates) {

          if (!this.authService.isAuthenticated()) {
              throw new Error('Not authenticated. Please login first.');
          }

          if (!Array.isArray(updates) || updates.length === 0) {
              throw new Error('Updates array cannot be empty');
          }

          try {
              const response = await fetch(`${this.apiBase}/admin/content/batch-update`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${this.authService.getToken()}`
                  },
                  body: JSON.stringify({ contents: updates })
              });

              if (!response.ok) {
                  const error = await response.json();
                  throw new Error(error.message || `Batch update failed: ${response.status}`);
              }

              const data = await response.json();

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
       * @param {string} pageName - Page to load content for
       * @returns {Promise<Object>} Content map {key: value}
       */
      async loadPageContent(pageName = 'landing') {
          try {
              const response = await fetch(`${this.apiBase}/admin/content/page-map/${pageName}`);

              if (!response.ok) {
                  console.warn(`Could not load content for page: ${pageName}`);
                  return {};
              }

              const contentMap = await response.json();

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
       * Get content for a page as array (with metadata)
       * @param {string} pageName - Page to load
       * @returns {Promise<Array>} Array of content items with metadata
       */
      async getPageContentWithMetadata(pageName = 'landing') {
          try {
              const response = await fetch(`${this.apiBase}/admin/content/page/${pageName}`);

              if (!response.ok) {
                  console.warn(`Could not load content for page: ${pageName}`);
                  return [];
              }

              const data = await response.json();
              console.log(`✅ Loaded content with metadata for page: ${pageName}`);

              return data.content || [];

          } catch (error) {
              console.error('❌ Error loading page content with metadata:', error);
              return [];
          }
      }

      /**
       * Get single content item from backend
       * @param {string} contentKey - Content key to retrieve
       * @returns {Promise<Object>} Content response
       */
      async getContent(contentKey) {
          try {
              const response = await fetch(`${this.apiBase}/admin/content/${contentKey}`);

              if (!response.ok) {
                  throw new Error(`Content not found: ${contentKey}`);
              }

              const data = await response.json();
              this.contentCache[contentKey] = data.contentValue;

              return data;

          } catch (error) {
              console.error('❌ Error loading content:', error);
              throw error;
          }
      }

      /**
       * Delete content from backend
       * @param {string} contentKey - Content to delete
       * @returns {Promise<Object>} Response from backend
       */
      async deleteContent(contentKey) {

          if (!this.authService.isAuthenticated()) {
              throw new Error('Not authenticated. Please login first.');
          }

          try {
              const response = await fetch(`${this.apiBase}/admin/content/${contentKey}`, {
                  method: 'DELETE',
                  headers: {
                      'Authorization': `Bearer ${this.authService.getToken()}`
                  }
              });

              if (!response.ok) {
                  throw new Error(`Delete failed: ${response.status}`);
              }

              delete this.contentCache[contentKey];
              console.log(`✅ Content deleted: ${contentKey}`);

              return await response.json();

          } catch (error) {
              console.error('❌ Content delete error:', error);
              throw error;
          }
      }

      /**
       * Get recent updates across all pages
       * @returns {Promise<Array>} List of recent updates
       */
      async getRecentUpdates() {
          try {
              const response = await fetch(`${this.apiBase}/admin/content/recent/updates`);

              if (!response.ok) {
                  return [];
              }

              return await response.json();

          } catch (error) {
              console.error('Error fetching recent updates:', error);
              return [];
          }
      }

      /**
       * Check if there are unsaved changes
       * @returns {boolean}
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
       * @returns {Object}
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