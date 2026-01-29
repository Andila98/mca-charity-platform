/**
 * Register Page
 * Handles user registration
 */

const RegisterPage = {
    form: null,
    submitButton: null,

    WARDS: [
        'Makadara', 'Kamukunji', 'Starehe', 'Mathare', 'Westlands',
        'Dagoretti North', 'Dagoretti South', 'Lang\'ata', 'Kibra',
        'Roysambu', 'Kasarani', 'Ruaraka', 'Embakasi South', 'Embakasi North',
        'Embakasi Central', 'Embakasi East', 'Embakasi West', 'Makongeni'
    ],

    /**
     * Initialize page
     */
    init() {
        // Redirect if already logged in
        if (AuthService.isLoggedIn()) {
            window.location.href = '../index.html';
            return;
        }

        this.form = document.getElementById('register-form');
        this.submitButton = document.getElementById('register-btn');

        this.populateWards();
        this.setupEventListeners();
    },

    /**
     * Populate ward dropdown
     */
    populateWards() {
        const wardSelect = document.getElementById('ward');

        this.WARDS.forEach(ward => {
            const option = document.createElement('option');
            option.value = ward;
            option.textContent = ward;
            wardSelect.appendChild(option);
        });
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Real-time validation
        const fields = ['fullName', 'email', 'phone', 'ward', 'password', 'confirmPassword'];
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', () => this.validateField(fieldId));
                field.addEventListener('input', () => ValidationUtil.clearFieldError(fieldId));
            }
        });

        // Password confirmation matching
        document.getElementById('confirmPassword').addEventListener('input', () => {
            this.validatePasswordMatch();
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

        // Add specific validation rules
        if (fieldId === 'email') {
            rules.email = true;
        } else if (fieldId === 'phone') {
            rules.phone = true;
        } else if (fieldId === 'password') {
            rules.password = true;
        } else if (fieldId === 'fullName') {
            rules.minLength = 3;
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
     * Validate password match
     */
    validatePasswordMatch() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (confirmPassword && password !== confirmPassword) {
            ValidationUtil.showFieldError('confirmPassword', 'Passwords do not match');
            return false;
        } else {
            ValidationUtil.clearFieldError('confirmPassword');
            return true;
        }
    },

    /**
     * Validate form
     */
    validateForm() {
        ValidationUtil.clearFormErrors('register-form');
        let isValid = true;

        // Validate all fields
        const fields = ['fullName', 'email', 'phone', 'ward', 'password'];
        fields.forEach(fieldId => {
            if (!this.validateField(fieldId)) {
                isValid = false;
            }
        });

        // Validate password match
        if (!this.validatePasswordMatch()) {
            isValid = false;
        }

        return isValid;
    },

    /**
     * Get form data
     */
    getFormData() {
        return {
            fullName: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            ward: document.getElementById('ward').value,
            password: document.getElementById('password').value,
            role: 'VIEWER' // Default role
        };
    },

    /**
     * Handle registration
     */
    async handleRegister() {
        // Validate form
        if (!this.validateForm()) {
            Toast.error('Please fix the errors in the form');
            return;
        }

        // Get form data
        const userData = this.getFormData();

        // Show loading state
        Loader.showButton(this.submitButton, 'Creating account...');

        try {
            // Register user
            const response = await AuthService.register(userData);

            // Hide loading state
            Loader.hideButton(this.submitButton);

            // Show success message
            this.showSuccess();

        } catch (error) {
            Loader.hideButton(this.submitButton);

            // Show error message
            if (error.message.includes('email') || error.message.includes('exists')) {
                Toast.error('An account with this email already exists');
            } else if (error.message.includes('phone')) {
                Toast.error('This phone number is already registered');
            } else {
                ErrorHandler.handle(error, 'Registration failed');
            }
        }
    },

    /**
     * Show success message
     */
    showSuccess() {
        const form = document.getElementById('register-form');
        const authFooter = document.querySelector('.auth-footer');
        const successMessage = document.getElementById('success-message');

        if (form && successMessage) {
            form.style.display = 'none';
            if (authFooter) authFooter.style.display = 'none';
            successMessage.style.display = 'block';
        }

        Toast.success('Registration successful! Awaiting admin approval.');
    }
};

// Initialize page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    RegisterPage.init();
});