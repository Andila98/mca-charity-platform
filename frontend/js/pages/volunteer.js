/**
 * Volunteer Registration Page
 * Handles volunteer registration form and display
 */

// Page state
const VolunteerPage = {
    form: null,
    submitButton: null,
    selectedInterests: [],

    // Configuration
    WARDS: [
        'Makadara', 'Kamukunji', 'Starehe', 'Mathare', 'Westlands',
        'Dagoretti North', 'Dagoretti South', 'Lang\'ata', 'Kibra',
        'Roysambu', 'Kasarani', 'Ruaraka', 'Embakasi South', 'Embakasi North',
        'Embakasi Central', 'Embakasi East', 'Embakasi West', 'Makongeni'
    ],

    INTERESTS: [
        'Education',
        'Healthcare',
        'Environment',
        'Community Development',
        'Youth Empowerment',
        'Elderly Care',
        'Food Security',
        'Clean Water',
        'Women Empowerment',
        'Children Welfare'
    ],

    /**
     * Initialize page
     */
    init() {
        this.form = document.getElementById('volunteer-form');
        this.submitButton = document.getElementById('submit-btn');

        this.populateWards();
        this.populateInterests();
        this.setupEventListeners();
        this.loadRecentVolunteers();
        this.setupCharacterCounter();
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
     * Populate interests checkboxes
     */
    populateInterests() {
        const container = document.getElementById('interests-container');

        this.INTERESTS.forEach((interest, index) => {
            const checkboxWrapper = document.createElement('div');
            checkboxWrapper.className = 'checkbox-wrapper';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `interest-${index}`;
            checkbox.value = interest;
            checkbox.name = 'interests';

            const label = document.createElement('label');
            label.htmlFor = `interest-${index}`;
            label.textContent = interest;

            checkboxWrapper.appendChild(checkbox);
            checkboxWrapper.appendChild(label);
            container.appendChild(checkboxWrapper);
        });
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Real-time validation
        const fields = ['name', 'email', 'phone', 'ward'];
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', () => this.validateField(fieldId));
                field.addEventListener('input', () => ValidationUtil.clearFieldError(fieldId));
            }
        });

        // Interest checkboxes
        const checkboxes = document.querySelectorAll('input[name="interests"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateSelectedInterests());
        });
    },

    /**
     * Setup character counter for bio
     */
    setupCharacterCounter() {
        const bioField = document.getElementById('bio');
        const counter = document.getElementById('bio-count');

        bioField.addEventListener('input', () => {
            counter.textContent = bioField.value.length;
        });
    },

    /**
     * Update selected interests
     */
    updateSelectedInterests() {
        const checkboxes = document.querySelectorAll('input[name="interests"]:checked');
        this.selectedInterests = Array.from(checkboxes).map(cb => cb.value);

        // Clear error if at least one is selected
        if (this.selectedInterests.length > 0) {
            const errorElement = document.getElementById('interests-error');
            if (errorElement) {
                errorElement.style.display = 'none';
                errorElement.textContent = '';
            }
        }
    },

    /**
     * Validate single field
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
     * Validate entire form
     */
    validateForm() {
        ValidationUtil.clearFormErrors('volunteer-form');
        let isValid = true;

        // Validate text fields
        const fields = ['name', 'email', 'phone', 'ward'];
        fields.forEach(fieldId => {
            if (!this.validateField(fieldId)) {
                isValid = false;
            }
        });

        // Validate interests
        if (this.selectedInterests.length === 0) {
            const errorElement = document.getElementById('interests-error');
            if (errorElement) {
                errorElement.textContent = 'Please select at least one area of interest';
                errorElement.style.display = 'block';
            }
            isValid = false;
        }

        return isValid;
    },

    /**
     * Get form data
     */
    getFormData() {
        return {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            ward: document.getElementById('ward').value,
            interests: this.selectedInterests,
            bio: document.getElementById('bio').value.trim() || null
        };
    },

    /**
     * Handle form submission
     */
    async handleSubmit() {
        // Validate form
        if (!this.validateForm()) {
            Toast.error('Please fix the errors in the form');
            return;
        }

        // Get form data
        const formData = this.getFormData();

        // Show loading state
        Loader.showButton(this.submitButton, 'Registering...');

        try {
            // Submit to API
            const response = await VolunteerService.register(formData);

            // Hide loading state
            Loader.hideButton(this.submitButton);

            // Show success message
            this.showSuccess(response);

            // Reset form
            this.form.reset();
            this.selectedInterests = [];

            // Uncheck all checkboxes
            const checkboxes = document.querySelectorAll('input[name="interests"]');
            checkboxes.forEach(cb => cb.checked = false);

            // Reload recent volunteers
            this.loadRecentVolunteers();

        } catch (error) {
            Loader.hideButton(this.submitButton);
            ErrorHandler.handle(error, 'Failed to register volunteer');
        }
    },

    /**
     * Show success message
     */
    showSuccess(response) {
        const formCard = this.form.closest('.form-card');
        const successCard = document.getElementById('success-card');
        const successMessage = document.getElementById('success-message');

        if (formCard && successCard) {
            formCard.style.display = 'none';
            successCard.style.display = 'block';

            if (response.name) {
                successMessage.textContent = `Thank you, ${response.name}! Your volunteer registration has been received. We'll contact you soon at ${response.email}.`;
            }

            // Scroll to success message
            successCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        Toast.success('Registration successful!');
    },

    /**
     * Load recent volunteers
     */
    async loadRecentVolunteers() {
        const container = document.getElementById('volunteers-list');
        if (!container) return;

        // Show loading
        Loader.showSkeleton('volunteers-list', 3);

        try {
            const volunteers = await VolunteerService.getRecent();

            if (!volunteers || volunteers.length === 0) {
                container.innerHTML = '<p class="no-data">No volunteers registered yet.</p>';
                return;
            }

            // Render volunteers
            container.innerHTML = '';
            volunteers.slice(0, 6).forEach(volunteer => {
                const card = this.createVolunteerCard(volunteer);
                container.appendChild(card);
            });

        } catch (error) {
            console.error('Failed to load volunteers:', error);
            container.innerHTML = '<p class="error-message">Failed to load volunteers</p>';
        }
    },

    /**
     * Create volunteer card element
     */
    createVolunteerCard(volunteer) {
        const card = document.createElement('div');
        card.className = 'volunteer-card';

        const avatar = document.createElement('div');
        avatar.className = 'volunteer-avatar';
        avatar.textContent = this.getInitials(volunteer.name);

        const info = document.createElement('div');
        info.className = 'volunteer-info';

        const name = document.createElement('h3');
        name.className = 'volunteer-name';
        name.textContent = volunteer.name;

        const ward = document.createElement('p');
        ward.className = 'volunteer-ward';
        ward.innerHTML = `<strong>Ward:</strong> ${volunteer.ward}`;

        const interests = document.createElement('div');
        interests.className = 'volunteer-interests';

        if (volunteer.interests && volunteer.interests.length > 0) {
            volunteer.interests.slice(0, 3).forEach(interest => {
                const tag = document.createElement('span');
                tag.className = 'interest-tag';
                tag.textContent = interest;
                interests.appendChild(tag);
            });
        }

        const registered = document.createElement('p');
        registered.className = 'volunteer-date';
        registered.textContent = `Joined ${FormatUtil.formatRelativeTime(volunteer.registeredAt)}`;

        info.appendChild(name);
        info.appendChild(ward);
        info.appendChild(interests);
        info.appendChild(registered);

        card.appendChild(avatar);
        card.appendChild(info);

        return card;
    },

    /**
     * Get initials from name
     */
    getInitials(name) {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return parts[0][0] + parts[1][0];
        }
        return name[0];
    }
};

// Initialize page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    VolunteerPage.init();
});