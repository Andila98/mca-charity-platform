/**
 * Admin Content Editor
 * Manages inline editing and saving of page content
 */
class AdminContentEditor {
    constructor(authService, contentManager) {
        this.authService = authService;
        this.contentManager = contentManager;
        this.currentEditElement = null;
        this.isEditMode = false;
        this.pageName = 'landing'; // Default page
    }

    /**
     * Initialize editor
     */
    init() {
        this.setupEventListeners();
        this.loadPageContent();
    }

    /**
     * Setup event listeners
     * @private
     */
    setupEventListeners() {
        // Handle clicks on editable elements
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('editable') && this.isEditMode) {
                this.startEdit(e);
            }
        });

        // Close editor on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cancelEdit();
            }
        });

        // Close editor on outside click
        const editor = document.getElementById('inlineEditor');
        if (editor) {
            document.addEventListener('click', (e) => {
                if (editor.classList.contains('active') &&
                    !editor.contains(e.target) &&
                    !e.target.classList.contains('editable')) {
                    this.cancelEdit();
                }
            });
        }
    }

    /**
     * Load page content from backend
     * @private
     */
    async loadPageContent() {
        if (!this.authService.isAuthenticated()) {
            console.log('⏭️  Skipping content load - not authenticated');
            return;
        }

        try {
            console.log('📥 Loading page content from backend...');
            const content = await this.contentManager.loadPageContent(this.pageName);
            this.applyContent(content);
            console.log('✅ Page content loaded');
        } catch (error) {
            console.error('❌ Failed to load content:', error);
        }
    }

    /**
     * Apply content to page elements
     * @private
     */
    applyContent(contentMap) {
        document.querySelectorAll('.editable').forEach(el => {
            const key = el.getAttribute('data-key');
            if (key && contentMap[key]) {
                el.textContent = contentMap[key];
            }
        });
    }

    /**
     * Enable edit mode
     */
    enableEditMode() {
        this.isEditMode = true;
        document.body.classList.add('edit-mode-active');
        console.log('✏️ Edit mode enabled');
    }

    /**
     * Disable edit mode
     */
    disableEditMode() {
        this.isEditMode = false;
        document.body.classList.remove('edit-mode-active');
        console.log('🔒 Edit mode disabled');
    }

    /**
     * Start editing an element
     * @private
     */
    startEdit(e) {
        e.stopPropagation();

        this.currentEditElement = e.target;
        const contentKey = this.currentEditElement.getAttribute('data-key');
        const currentContent = this.currentEditElement.textContent;

        const editor = document.getElementById('inlineEditor');
        const textarea = document.getElementById('editorContent');

        // Set initial content
        textarea.value = currentContent;
        editor.classList.add('active');

        // Position editor near clicked element
        const rect = this.currentEditElement.getBoundingClientRect();
        editor.style.top = (rect.top + window.scrollY - 120) + 'px';
        editor.style.left = Math.min(rect.left + window.scrollX, window.innerWidth - 350) + 'px';

        // Store data
        editor.dataset.contentKey = contentKey;
        editor.dataset.pageName = this.pageName;

        textarea.focus();
        textarea.select();
    }

    /**
     * Save current edit
     */
    async saveEdit() {
        if (!this.currentEditElement) return;

        const editor = document.getElementById('inlineEditor');
        const textarea = document.getElementById('editorContent');
        const newContent = textarea.value.trim();
        const contentKey = editor.dataset.contentKey;
        const pageName = editor.dataset.pageName;

        if (!newContent) {
            alert('Content cannot be empty');
            return;
        }

        // Update in DOM first (for immediate feedback)
        this.currentEditElement.textContent = newContent;

        // Mark as unsaved
        this.contentManager.markDirty();

        // Update cache
        this.contentManager.contentCache[contentKey] = newContent;

        console.log(`📝 Changed: ${contentKey} (unsaved)`);
        this.cancelEdit();
    }

    /**
     * Cancel current edit
     */
    cancelEdit() {
        const editor = document.getElementById('inlineEditor');
        if (editor) {
            editor.classList.remove('active');
        }
        this.currentEditElement = null;
    }

    /**
     * Save all changes to backend
     */
    async saveAllChanges() {
        if (!this.authService.isAuthenticated()) {
            alert('❌ You must be logged in to save changes');
            return false;
        }

        const changes = this.contentManager.getCachedContent();

        if (Object.keys(changes).length === 0) {
            alert('⚠️ No changes to save');
            return false;
        }

        // Prepare batch update
        const updates = Object.entries(changes).map(([key, value]) => ({
            contentKey: key,
            contentValue: value,
            pageName: this.pageName
        }));

        try {
            console.log(`💾 Saving ${updates.length} changes to backend...`);

            const btn = document.querySelector('[onclick="saveLandingPageChanges()"]');
            if (btn) {
                btn.disabled = true;
                btn.textContent = '⏳ Saving...';
            }

            await this.contentManager.batchUpdateContent(updates);

            if (btn) {
                btn.disabled = false;
                btn.textContent = '💾 Save Changes';
            }

            alert('✅ All changes saved successfully!');
            return true;

        } catch (error) {
            alert('❌ Failed to save changes: ' + error.message);
            console.error('Save error:', error);
            return false;
        }
    }

    /**
     * Get unsaved change count
     * @returns {number}
     */
    getUnsavedChangeCount() {
        return Object.keys(this.contentManager.getCachedContent()).length;
    }

    /**
     * Discard unsaved changes
     */
    discardChanges() {
        if (confirm('⚠️ Discard all unsaved changes?')) {
            this.contentManager.clearCache();
            this.loadPageContent();
            console.log('Changes discarded');
            return true;
        }
        return false;
    }

    /**
     * Set page name (for pages other than landing)
     */
    setPageName(pageName) {
        this.pageName = pageName;
        console.log(`📄 Content editor switched to page: ${pageName}`);
    }
}

// ============================================================
// GLOBAL INITIALIZATION
// ============================================================

let contentManager;
let contentEditor;

// Initialize when admin services are ready
function initializeContentManagement() {
    if (!window.adminAuthService) {
        console.warn('⚠️ Admin auth service not initialized yet');
        setTimeout(initializeContentManagement, 500);
        return;
    }

    contentManager = new ContentManager('http://localhost:8080/api', adminAuthService);
    contentEditor = new AdminContentEditor(adminAuthService, contentManager);

    console.log('🚀 Content management system initialized');
    console.log('💡 Content will auto-load when admin logs in');
}

document.addEventListener('DOMContentLoaded', initializeContentManagement);

// ============================================================
// GLOBAL HELPER FUNCTIONS
// ============================================================

/**
 * Save all page changes
 * Called from HTML button onclick
 */
async function saveLandingPageChanges() {
    if (!contentEditor) {
        alert('❌ Content editor not initialized');
        return;
    }

    await contentEditor.saveAllChanges();
}

/**
 * Save inline edit
 * Called from inline editor Save button
 */
async function saveInlineEdit() {
    if (!contentEditor) {
        alert('❌ Content editor not initialized');
        return;
    }

    await contentEditor.saveEdit();
}

/**
 * Cancel inline edit
 * Called from inline editor Cancel button
 */
function cancelInlineEdit() {
    if (contentEditor) {
        contentEditor.cancelEdit();
    }
}

/**
 * Discard all changes
 */
function discardPageChanges() {
    if (contentEditor) {
        contentEditor.discardChanges();
    }
}