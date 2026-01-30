/**
 * Login Page
 * Handles user authentication
 */

const LoginPage = {
    form: null,
    submitButton: null,

    /**
     * Initialize page
     */
    init() {
        // Redirect if already logged in
        if (AuthService.isLoggedIn()) {
            this.redirectToDashboard();
            return;
        }

        this.form = document.getElementById('login-form');
        this.submitButton = document.getElementById('login-btn');

        this.setupEventListeners();
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Real-time validation
        ['email', 'password'].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', () => this.validateField(fieldId));
                field.addEventListener('input', () => ValidationUtil.clearFieldError(fieldId));
            }
        });
    },

    /**
     * Validate field
     */
    validateField(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return true;

        const value = field.value.trim();
        let rules = { required: true };

        if (fieldId === 'email') {
            rules.email = true;
        } else if (fieldId === 'password') {
            rules.minLength = 6;
        }

        const errors = ValidationUtil.validateField(value, rules);

        if (errors.length > 0) {
            ValidationUtil.showFieldError(fieldId, errors[0]);
            return false;
        } else {
            ValidationUtil.clearFieldError(fieldId);
            return true;
        }
    },

    /**
     * Validate form
     */
    validateForm() {
        ValidationUtil.clearFormErrors('login-form');

        const emailValid = this.validateField('email');
        const passwordValid = this.validateField('password');

        return emailValid && passwordValid;
    },

    /**
     * Handle login
     */
    async handleLogin() {
        // Validate form
        if (!this.validateForm()) {
            Toast.error('Please fix the errors in the form');
            return;
        }

        // Get credentials
        const credentials = {
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value
        };

        // Show loading state
        Loader.showButton(this.submitButton, 'Logging in...');

        try {
            // Attempt login
            const response = await AuthService.login(credentials);

            // Hide loading state
            Loader.hideButton(this.submitButton);

            // Show success message
            Toast.success(`Welcome back, ${response.user.fullName}!`);

            // Redirect based on role
            setTimeout(() => {
                this.redirectToDashboard();
            }, 1000);

        } catch (error) {
            Loader.hideButton(this.submitButton);

            // Show error message
            if (error.message.includes('401') || error.message.includes('credentials')) {
                Toast.error('Invalid email or password');
            } else {
                ErrorHandler.handle(error, 'Login failed');
            }
        }
    },

    /**
     * Redirect to appropriate dashboard
     */
    redirectToDashboard() {
        const user = AuthService.getCurrentUser();

        if (!user) {
            window.location.href = '../index.html';
            return;
        }

        // Redirect based on role
        if (user.role === 'ADMIN') {
            window.location.href = 'admin/dashboard.html';
        } else if (user.role === 'EDITOR') {
            window.location.href = 'admin/dashboard.html';
        } else {
            window.location.href = '../index.html';
        }
    }
};

// Initialize page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    LoginPage.init();
});