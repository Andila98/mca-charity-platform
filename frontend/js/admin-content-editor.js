/**
 * Admin Content Editor (Multi-Page Aware)
 * Manages inline editing and saving of page content.
 */
class AdminContentEditor {
    constructor(authService, contentManager) {
        this.authService = authService;
        this.contentManager = contentManager;
        this.currentEditElement = null;
        this.isEditMode = false;
        this.pageName = getCurrentPageName(); // Auto-detect page

        if(this.contentManager) {
            this.contentManager.pageName = this.pageName;
        }
    }

    /**
     * Initialize editor
     */
    init() {
        this.setupEventListeners();
        // Load content if authenticated
        if (this.authService.isAuthenticated()) {
            this.loadPageContent();
        }
    }

    /**
     * Setup event listeners
     * @private
     */
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('editable') && this.isEditMode) {
                this.startEdit(e);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cancelEdit();
            }
        });

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
     */
    async loadPageContent() {
        try {
            console.log(`📥 Loading content for page: ${this.pageName}...`);
            const content = await this.contentManager.loadPageContent(this.pageName);
            this.applyContent(content);
            console.log('✅ Page content loaded and applied');
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
        console.log(`✏️ Edit mode enabled for page: ${this.pageName}`);
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

        textarea.value = currentContent;
        editor.classList.add('active');

        const rect = this.currentEditElement.getBoundingClientRect();
        editor.style.top = (rect.top + window.scrollY - 120) + 'px';
        editor.style.left = Math.min(rect.left + window.scrollX, window.innerWidth - 350) + 'px';

        editor.dataset.contentKey = contentKey;
        textarea.focus();
        textarea.select();
    }

    /**
     * Save current edit to cache
     */
    saveEdit() {
        if (!this.currentEditElement) return;

        const editor = document.getElementById('inlineEditor');
        const textarea = document.getElementById('editorContent');
        const newContent = textarea.value.trim();
        const contentKey = editor.dataset.contentKey;

        if (!newContent) {
            alert('Content cannot be empty');
            return;
        }

        this.currentEditElement.textContent = newContent;
        this.contentManager.markDirty();
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
        if (Object.keys(changes).length === 0 && !this.contentManager.hasUnsavedChanges()) {
            alert('⚠️ No changes to save');
            return false;
        }

        const updates = Object.entries(changes).map(([key, value]) => ({
            contentKey: key,
            contentValue: value,
            pageName: this.pageName
        }));

        const btn = document.querySelector('.admin-btn.save-btn');
        try {
            console.log(`💾 Saving ${updates.length} changes for page '${this.pageName}'...`);
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
            this.contentManager.clearDirty();
            return true;

        } catch (error) {
            alert('❌ Failed to save changes: ' + error.message);
            console.error('Save error:', error);
            if(btn) {
                btn.disabled = false;
                btn.textContent = '💾 Save Changes';
            }
            return false;
        }
    }
}

// ============================================================
// GLOBAL INITIALIZATION
// ============================================================

let contentManager;
let contentEditor;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof adminAPI === 'undefined' || typeof adminAuthService === 'undefined') {
        console.error('CRITICAL: Core services not found. Check script loading order.');
        return;
    }

    contentManager = new ContentManager(adminAPI);
    contentEditor = new AdminContentEditor(adminAuthService, contentManager);

    // Initialize after auth status is known
    if(adminAuthService.isAuthenticated()) {
        contentEditor.init();
    }

    window.contentManager = contentManager;
    window.contentEditor = contentEditor;

    console.log('🚀 Content management system initialized for multi-page support.');
});

// ============================================================
// GLOBAL HELPER FUNCTIONS
// ============================================================

async function savePageChanges() {
    if (contentEditor) {
        await contentEditor.saveAllChanges();
    }
}

async function saveInlineEdit() {
    if (contentEditor) {
        contentEditor.saveEdit();
    }
}

function cancelInlineEdit() {
    if (contentEditor) {
        contentEditor.cancelEdit();
    }
}
