/**
 * Admin UI Controller
 * Manages login modal, admin bar, and UI state
 */
class AdminUIController {
    constructor(authService) {
        this.authService = authService;
        this.isEditMode = false;
        this.currentEditElement = null;
    }

    /**
     * Initialize admin UI
     */
    init() {
        this.setupEventListeners();
        this.checkAdminStatus();
        this.setupKeyboardShortcuts();
    }

    /**
     * Setup event listeners
     * @private
     */
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('adminLoginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Close modal on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeLoginModal();
            }
        });

        // Close modal on background click
        const modal = document.getElementById('adminLoginModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeLoginModal();
                }
            });
        }
    }

    /**
     * Setup keyboard shortcuts
     * Ctrl+Shift+A (Windows/Linux) or Cmd+Shift+A (Mac) to toggle admin mode
     * @private
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                
                if (this.authService.isAuthenticated()) {
                    this.toggleEditMode();
                } else {
                    this.openLoginModal();
                }
            }
        });
    }

    /**
     * Check if admin is already logged in
     * @private
     */
    async checkAdminStatus() {
        if (this.authService.isAuthenticated()) {
            // Verify token is still valid
            const isValid = await this.authService.validateToken();
            
            if (isValid) {
                this.showAdminUI();
            } else {
                // Token expired
                this.authService.logout();
                this.hideAdminUI();
            }
        } else {
            this.hideAdminUI();
        }
    }

    /**
     * Handle login form submission
     * @private
     */
    async handleLogin(e) {
        e.preventDefault();

        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value;
        const errorMsg = document.getElementById('adminErrorMessage');

        // Clear previous error
        errorMsg.classList.remove('show');
        errorMsg.textContent = '';

        if (!username || !password) {
            this.showError('Username and password are required');
            return;
        }

        // Show loading state
        const submitBtn = document.getElementById('adminLoginSubmit');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Logging in...';

        try {
            const response = await this.authService.login(username, password);
            
            console.log('✅ Login successful:', response);
            this.closeLoginModal();
            this.showAdminUI();

            // Redirect to dashboard
            this.redirectToDashboard();

        } catch (error) {
            this.showError(error.message);
            // Clear password field
            document.getElementById('adminPassword').value = '';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    /**
     * Redirect to admin dashboard
     * @private
     */
    redirectToDashboard() {
        const path = window.location.pathname;
        let dashboardPath = 'pages/admin/dashboard.html';

        if (path.includes('/pages/')) {
            dashboardPath = 'admin/dashboard.html';
        }

        // If we are already in admin folder (unlikely for this modal, but possible)
        if (path.includes('/pages/admin/')) {
            dashboardPath = 'dashboard.html';
        }

        window.location.href = dashboardPath;
    }

    /**
     * Open login modal
     */
    openLoginModal() {
        const modal = document.getElementById('adminLoginModal');
        if (modal) {
            modal.classList.add('active');
            document.getElementById('adminUsername').focus();
        }
    }

    /**
     * Close login modal
     */
    closeLoginModal() {
        const modal = document.getElementById('adminLoginModal');
        if (modal) {
            modal.classList.remove('active');
            document.getElementById('adminLoginForm').reset();
        }
    }

    /**
     * Show admin UI (bar and buttons)
     * @private
     */
    showAdminUI() {
        // Show admin bar
        const adminBar = document.getElementById('adminBar');
        if (adminBar) {
            adminBar.classList.add('active');
        }

        // Show logout button
        const logoutBtn = document.getElementById('adminLogoutBtn');
        if (logoutBtn) {
            logoutBtn.classList.add('visible');
        }

        // Hide login link
        const adminLink = document.getElementById('adminLink');
        if (adminLink) {
            adminLink.classList.remove('visible');
        }

        // Show image gallery if on page
        const gallery = document.querySelector('.image-gallery-container');
        if (gallery) {
            gallery.style.display = 'block';
        }

        console.log('📊 Admin UI shown');
    }

    /**
     * Hide admin UI (bar and buttons)
     * @private
     */
    hideAdminUI() {
        // Hide admin bar
        const adminBar = document.getElementById('adminBar');
        if (adminBar) {
            adminBar.classList.remove('active');
        }

        // Hide logout button
        const logoutBtn = document.getElementById('adminLogoutBtn');
        if (logoutBtn) {
            logoutBtn.classList.remove('visible');
        }

        // Show login link
        const adminLink = document.getElementById('adminLink');
        if (adminLink) {
            adminLink.classList.add('visible');
        }

        // Hide image gallery
        const gallery = document.querySelector('.image-gallery-container');
        if (gallery) {
            gallery.style.display = 'none';
        }

        console.log('🔒 Admin UI hidden');
    }

    /**
     * Toggle edit mode
     */
    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        document.body.classList.toggle('edit-mode-active', this.isEditMode);

        if (this.isEditMode) {
            console.log('✏️ Edit mode enabled');
            this.enableEditing();
        } else {
            console.log('🔒 Edit mode disabled');
            this.disableEditing();
        }
    }

    /**
     * Enable editing on all editable elements
     * @private
     */
    enableEditing() {
        document.querySelectorAll('.editable').forEach(el => {
            el.addEventListener('click', (e) => this.startEdit(e));
            el.style.cursor = 'pointer';
        });
    }

    /**
     * Disable editing on all editable elements
     * @private
     */
    disableEditing() {
        document.querySelectorAll('.editable').forEach(el => {
            el.removeEventListener('click', (e) => this.startEdit(e));
            el.style.cursor = 'default';
        });
    }

    /**
     * Start editing an element
     * @private
     */
    startEdit(e) {
        if (!this.isEditMode) return;
        
        e.stopPropagation();
        this.currentEditElement = e.target;
        
        const content = this.currentEditElement.textContent;
        const editor = document.getElementById('inlineEditor');
        const textarea = document.getElementById('editorContent');

        textarea.value = content;
        editor.classList.add('active');

        const rect = this.currentEditElement.getBoundingClientRect();
        editor.style.top = (rect.top + window.scrollY - 120) + 'px';
        editor.style.left = Math.min(rect.left + window.scrollX, window.innerWidth - 350) + 'px';

        textarea.focus();
        textarea.select();
    }

    /**
     * Handle logout
     */
    logout() {
        if (this.isEditMode) {
            const confirmed = confirm('⚠️ You have unsaved changes. Are you sure you want to logout?');
            if (!confirmed) return;
        }

        this.authService.logout();
        this.isEditMode = false;
        this.disableEditing();
        document.body.classList.remove('edit-mode-active');
        this.hideAdminUI();

        alert('👋 You have been logged out successfully');
    }

    /**
     * Show error message
     * @private
     */
    showError(message) {
        const errorMsg = document.getElementById('adminErrorMessage');
        if (errorMsg) {
            errorMsg.textContent = '❌ ' + message;
            errorMsg.classList.add('show');
        } else {
            alert('❌ Error: ' + message);
        }
    }
}

// ============================================================
// INITIALIZATION
// ============================================================

let adminAuthService;
let adminUIController;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize services
    // adminAPI is global from api.service.js
    if (typeof adminAPI === 'undefined') {
        console.error('CRITICAL: adminAPI not found. Check script loading order.');
        return;
    }

    adminAuthService = new AdminAuthService(adminAPI);
    adminUIController = new AdminUIController(adminAuthService);
    adminUIController.init();

    // Expose to global/window so other non-module scripts can access
    window.adminAuthService = adminAuthService;
    window.adminUIController = adminUIController;

    console.log('🚀 Admin authentication system initialized');
    console.log('💡 Tip: Press Ctrl+Shift+A to toggle admin mode');
});

// ============================================================
// HELPER FUNCTIONS (Global scope for HTML onclick handlers)
// ============================================================

function openAdminLogin() {
    adminUIController.openLoginModal();
}

function closeAdminLogin() {
    adminUIController.closeLoginModal();
}

function adminLogout() {
    adminUIController.logout();
}
