/**
 * ============================================================================
 * VOLUNTEER SERVICE & UI
 * ============================================================================
 *
 * Handles public-facing volunteer registration and display.
 *
 * @version 1.0.0
 * @date 2026-02-03
 */

import { isValidEmail, isValidPhone, clearErrors, setError } from './validation.js';

// ============================================================================
// SERVICE CLASS (Handles data logic)
// ============================================================================

class VolunteerService {
    constructor(apiClient) {
        if (!apiClient) {
            throw new Error('VolunteerService requires an API client.');
        }
        this.api = apiClient;
    }

    /**
     * Registers a new volunteer.
     * @param {object} volunteerData - The volunteer's information.
     * @returns {Promise<object>} The newly created volunteer object.
     */
    async register(volunteerData) {
        // Ensure data matches backend expectations (camelCase)
        const payload = {
            name: volunteerData.name,
            email: volunteerData.email,
            phone: volunteerData.phone,
            ward: volunteerData.ward,
            interests: volunteerData.interests || [],
            bio: volunteerData.bio,
            // Default status for new public registrations
            status: 'PENDING'
        };
        return this.api.registerVolunteer(payload);
    }

    /**
     * Gets all active volunteers.
     * @returns {Promise<Array<object>>} A list of active volunteers.
     */
    async getActiveVolunteers() {
        return this.api.getVolunteersByStatus('ACTIVE');
    }

    /**
     * Gets a limited number of recent, active volunteers.
     * @param {number} limit - The maximum number of volunteers to return.
     * @returns {Promise<Array<object>>} A list of recent volunteers.
     */
    async getRecentActiveVolunteers(limit = 6) {
        try {
            const volunteers = await this.getActiveVolunteers();
            // Sort by registration date (assuming 'createdAt' or similar field)
            // and take the most recent ones.
            return volunteers
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                .slice(0, limit);
        } catch (error) {
            console.error("Could not fetch recent volunteers:", error);
            return [];
        }
    }
}


// ============================================================================
// UI CONTROLLER CLASS (Handles DOM interactions)
// ============================================================================

class VolunteerUIController {
    constructor(volunteerService) {
        this.service = volunteerService;

        // Form elements
        this.form = document.getElementById('volunteer-form');
        this.submitBtn = document.getElementById('submit-btn');
        this.successCard = document.getElementById('success-card');
        this.formCard = document.querySelector('.form-card');

        // Recent volunteers display
        this.volunteersList = document.getElementById('volunteers-list');

        // Bio character counter
        this.bioInput = document.getElementById('bio');
        this.bioCount = document.getElementById('bio-count');
    }

    /**
     * Initializes all event listeners and loads initial data.
     */
    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        if (this.bioInput && this.bioCount) {
            this.bioInput.addEventListener('input', () => this.updateBioCount());
        }
        if (this.volunteersList) {
            this.loadAndRenderRecentVolunteers();
        }
    }

    /**
     * Validates the registration form.
     * @returns {boolean} - True if the form is valid, false otherwise.
     */
    validateForm() {
        clearErrors(this.form);
        let isValid = true;

        const name = document.getElementById('name').value.trim();
        if (!name) {
            setError('name', 'Please enter your full name.');
            isValid = false;
        }

        const email = document.getElementById('email').value.trim();
        if (!email) {
            setError('email', 'Please enter your email address.');
            isValid = false;
        } else if (!isValidEmail(email)) {
            setError('email', 'Please enter a valid email address.');
            isValid = false;
        }

        const phone = document.getElementById('phone').value.trim();
        if (!phone) {
            setError('phone', 'Please enter your phone number.');
            isValid = false;
        } else if (!isValidPhone(phone)) {
            setError('phone', 'Please enter a valid phone number.');
            isValid = false;
        }

        const ward = document.getElementById('ward').value;
        if (!ward) {
            setError('ward', 'Please select your ward.');
            isValid = false;
        }

        const interests = document.querySelectorAll('input[name="interests"]:checked').length;
        if (interests === 0) {
            const interestsError = document.getElementById('interests-error');
            if (interestsError) {
                interestsError.textContent = 'Please select at least one area of interest.';
            }
            isValid = false;
        }

        return isValid;
    }

    /**
     * Handles the submission of the volunteer registration form.
     * @param {Event} e - The form submission event.
     */
    async handleFormSubmit(e) {
        e.preventDefault();
        if (!this.validateForm()) {
            return;
        }

        const originalBtnText = this.submitBtn.textContent;
        this.submitBtn.disabled = true;
        this.submitBtn.textContent = 'Submitting...';

        try {
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData.entries());
            data.interests = formData.getAll('interests');

            await this.service.register(data);

            this.formCard.style.display = 'none';
            this.successCard.style.display = 'block';

        } catch (error) {
            if (error.message.includes('409') || error.message.toLowerCase().includes('conflict')) {
                alert('Registration failed: This email or phone number is already registered.');
            } else {
                alert('Registration failed: ' + error.message);
            }
        } finally {
            this.submitBtn.disabled = false;
            this.submitBtn.textContent = originalBtnText;
        }
    }

    /**
     * Fetches and displays recent volunteers.
     */
    async loadAndRenderRecentVolunteers() {
        this.volunteersList.innerHTML = '<p>Loading recent volunteers...</p>';
        const volunteers = await this.service.getRecentActiveVolunteers();

        if (!volunteers || volunteers.length === 0) {
            this.volunteersList.innerHTML = '<p>Be the first to join our volunteer team!</p>';
            return;
        }

        this.volunteersList.innerHTML = volunteers.map(v => `
            <div class="volunteer-card">
                <div class="volunteer-avatar">${v.name.charAt(0)}</div>
                <div class="volunteer-info">
                    <h4>${v.name}</h4>
                    <p>Joined from ${v.ward}</p>
                </div>
            </div>
        `).join('');
    }

    /**
     * Updates the character count for the bio textarea.
     */
    updateBioCount() {
        this.bioCount.textContent = this.bioInput.value.length;
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // The global `apiClient` is expected to be available from `api-client.js`
    if (typeof apiClient === 'undefined') {
        console.error('CRITICAL: apiClient is not defined. Ensure api-client.js is loaded before volunteer.js.');
        return;
    }

    const volunteerService = new VolunteerService(apiClient);
    const volunteerUI = new VolunteerUIController(volunteerService);
    volunteerUI.init();

    // Expose to window if needed for debugging, but not required for functionality
    window.volunteerService = volunteerService;
});