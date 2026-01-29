/**
 * Donation Page
 * Handles donation form and statistics display
 */

const DonatePage = {
    form: null,
    submitButton: null,
    currentDonationType: 'CASH',

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
        this.form = document.getElementById('donation-form');
        this.submitButton = document.getElementById('submit-btn');

        this.populateWards();
        this.loadProjects();
        this.setupEventListeners();
        this.loadStatistics();
    },

    /**
     * Populate ward dropdown
     */
    populateWards() {
        const wardSelect = document.getElementById('donorWard');

        this.WARDS.forEach(ward => {
            const option = document.createElement('option');
            option.value = ward;
            option.textContent = ward;
            wardSelect.appendChild(option);
        });
    },

    /**
     * Load projects for dropdown
     */
    async loadProjects() {
        try {
            const projects = await ProjectService.getByStatus('ONGOING');
            const projectSelect = document.getElementById('project');

            if (projects && projects.length > 0) {
                projects.forEach(project => {
                    const option = document.createElement('option');
                    option.value = project.id;
                    option.textContent = project.name;
                    projectSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Failed to load projects:', error);
        }
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

        // Donation type change
        const typeRadios = document.querySelectorAll('input[name="donationType"]');
        typeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentDonationType = e.target.value;
                this.updateFormFields();
            });
        });

        // Real-time validation
        const fields = ['donorName', 'donorEmail', 'donorPhone', 'amount'];
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', () => this.validateField(fieldId));
                field.addEventListener('input', () => ValidationUtil.clearFieldError(fieldId));
            }
        });
    },

    /**
     * Update form fields based on donation type
     */
    updateFormFields() {
        const amountGroup = document.getElementById('amount-group');
        const itemGroup = document.getElementById('item-group');
        const serviceGroup = document.getElementById('service-group');

        const amountField = document.getElementById('amount');
        const itemField = document.getElementById('itemDescription');
        const serviceField = document.getElementById('serviceDescription');

        // Hide all conditional fields
        amountGroup.classList.add('hidden');
        itemGroup.classList.add('hidden');
        serviceGroup.classList.add('hidden');

        // Clear values
        amountField.value = '';
        itemField.value = '';
        serviceField.value = '';

        // Clear errors
        ValidationUtil.clearFieldError('amount');
        ValidationUtil.clearFieldError('itemDescription');
        ValidationUtil.clearFieldError('serviceDescription');

        // Show relevant field
        switch (this.currentDonationType) {
            case 'CASH':
                amountGroup.classList.remove('hidden');
                amountField.required = true;
                itemField.required = false;
                serviceField.required = false;
                break;
            case 'ITEM':
                itemGroup.classList.remove('hidden');
                amountField.required = false;
                itemField.required = true;
                serviceField.required = false;
                break;
            case 'SERVICE':
                serviceGroup.classList.remove('hidden');
                amountField.required = false;
                itemField.required = false;
                serviceField.required = true;
                break;
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
        if (fieldId === 'donorEmail') {
            rules.email = true;
        } else if (fieldId === 'donorPhone') {
            rules.phone = true;
        } else if (fieldId === 'amount') {
            rules.min = 1;
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
        ValidationUtil.clearFormErrors('donation-form');
        let isValid = true;

        // Validate donor information
        const fields = ['donorName', 'donorEmail', 'donorPhone'];
        fields.forEach(fieldId => {
            if (!this.validateField(fieldId)) {
                isValid = false;
            }
        });

        // Validate based on donation type
        if (this.currentDonationType === 'CASH') {
            if (!this.validateField('amount')) {
                isValid = false;
            }
        } else if (this.currentDonationType === 'ITEM') {
            const itemDesc = document.getElementById('itemDescription').value.trim();
            if (!itemDesc) {
                ValidationUtil.showFieldError('itemDescription', 'Item description is required');
                isValid = false;
            }
        } else if (this.currentDonationType === 'SERVICE') {
            const serviceDesc = document.getElementById('serviceDescription').value.trim();
            if (!serviceDesc) {
                ValidationUtil.showFieldError('serviceDescription', 'Service description is required');
                isValid = false;
            }
        }

        return isValid;
    },

    /**
     * Get form data
     */
    getFormData() {
        const projectId = document.getElementById('project').value;

        const data = {
            donationType: this.currentDonationType,
            donorName: document.getElementById('donorName').value.trim(),
            donorEmail: document.getElementById('donorEmail').value.trim(),
            donorPhone: document.getElementById('donorPhone').value.trim(),
            donorWard: document.getElementById('donorWard').value || null,
            projectId: projectId ? parseInt(projectId) : null,
            notes: document.getElementById('notes').value.trim() || null,
            status: 'PENDING'
        };

        // Add type-specific fields
        if (this.currentDonationType === 'CASH') {
            data.amount = parseFloat(document.getElementById('amount').value);
            data.itemDescription = null;
        } else if (this.currentDonationType === 'ITEM') {
            data.amount = null;
            data.itemDescription = document.getElementById('itemDescription').value.trim();
        } else if (this.currentDonationType === 'SERVICE') {
            data.amount = null;
            data.itemDescription = document.getElementById('serviceDescription').value.trim();
        }

        return data;
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
        Loader.showButton(this.submitButton, 'Submitting...');

        try {
            // Submit to API
            const response = await DonationService.create(formData);

            // Hide loading state
            Loader.hideButton(this.submitButton);

            // Show success message
            this.showSuccess(response);

            // Reset form
            this.form.reset();
            this.currentDonationType = 'CASH';
            this.updateFormFields();

            // Reload statistics
            this.loadStatistics();

        } catch (error) {
            Loader.hideButton(this.submitButton);
            ErrorHandler.handle(error, 'Failed to submit donation');
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

            let message = `Thank you, ${response.donorName}!`;

            if (response.donationType === 'CASH') {
                message += ` Your donation of ${FormatUtil.formatCurrency(response.amount)} has been received.`;
            } else if (response.donationType === 'ITEM') {
                message += ` Your item donation has been recorded.`;
            } else if (response.donationType === 'SERVICE') {
                message += ` Your service donation has been recorded.`;
            }

            message += ` We'll contact you soon at ${response.donorEmail}.`;

            successMessage.textContent = message;

            // Scroll to success message
            successCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        Toast.success('Donation submitted successfully!');
    },

    /**
     * Load statistics
     */
    async loadStatistics() {
        try {
            // Load all donations
            const donations = await DonationService.getAll();

            // Calculate total donations
            const totalDonations = donations.length;
            document.getElementById('total-donations').textContent = FormatUtil.formatNumber(totalDonations);

            // Calculate total cash amount
            const totalAmount = donations
                .filter(d => d.donationType === 'CASH' && d.amount)
                .reduce((sum, d) => sum + parseFloat(d.amount), 0);
            document.getElementById('total-amount').textContent = FormatUtil.formatCurrency(totalAmount);

            // Load project stats
            const projects = await ProjectService.getAll();
            const activeProjects = projects.filter(p => p.status === 'ONGOING').length;
            document.getElementById('active-projects').textContent = FormatUtil.formatNumber(activeProjects);

            // Calculate total beneficiaries
            const totalBeneficiaries = projects
                .filter(p => p.actualBeneficiaries)
                .reduce((sum, p) => sum + parseInt(p.actualBeneficiaries), 0);
            document.getElementById('beneficiaries').textContent = FormatUtil.formatNumber(totalBeneficiaries);

        } catch (error) {
            console.error('Failed to load statistics:', error);
        }
    }
};

// Initialize page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    DonatePage.init();
});