/**
 * Admin Donations Management Page
 * View and manage all donations
 */

const AdminDonations = {
    allDonations: [],
    filteredDonations: [],
    allProjects: [],

    /**
     * Initialize page
     */
    init() {
        if (!AuthService.requireAdmin()) return;

        this.setupEventListeners();
        this.loadData();
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            AuthService.logout();
            window.location.href = '../login.html';
        });

        // Export
        document.getElementById('export-donations-btn').addEventListener('click', () => {
            this.exportDonations();
        });

        // Filters
        document.getElementById('status-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('type-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('project-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('search-input').addEventListener('input', () => this.applyFilters());
        document.getElementById('reset-filters').addEventListener('click', () => this.resetFilters());

        // Status modal
        document.getElementById('status-modal-close').addEventListener('click', () => this.closeStatusModal());
        document.getElementById('status-cancel-btn').addEventListener('click', () => this.closeStatusModal());
        document.getElementById('status-save-btn').addEventListener('click', () => this.saveStatusUpdate());
    },

    /**
     * Load data
     */
    async loadData() {
        try {
            Loader.show('Loading donations...');

            [this.allDonations, this.allProjects] = await Promise.all([
                DonationService.getAll(),
                ProjectService.getAll()
            ]);

            this.filteredDonations = [...this.allDonations];

            this.populateProjectDropdown();
            this.renderDonations();
            this.updateStats();
            this.updateDonationCount();

            Loader.hide();
        } catch (error) {
            Loader.hide();
            ErrorHandler.handle(error, 'Failed to load donations');
        }
    },

    /**
     * Populate project dropdown
     */
    populateProjectDropdown() {
        const select = document.getElementById('project-filter');

        // Clear existing options (except first)
        while (select.options.length > 1) {
            select.remove(1);
        }

        // Add projects
        this.allProjects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            select.appendChild(option);
        });
    },

    /**
     * Apply filters
     */
    applyFilters() {
        const status = document.getElementById('status-filter').value;
        const type = document.getElementById('type-filter').value;
        const projectId = document.getElementById('project-filter').value;
        const search = document.getElementById('search-input').value.toLowerCase();

        this.filteredDonations = this.allDonations.filter(donation => {
            // Status filter
            if (status && donation.status !== status) return false;

            // Type filter
            if (type && donation.donationType !== type) return false;

            // Project filter
            if (projectId) {
                if (!donation.projectId || donation.projectId.toString() !== projectId) return false;
            }

            // Search filter
            if (search &&
                !donation.donorName.toLowerCase().includes(search) &&
                !(donation.donorEmail && donation.donorEmail.toLowerCase().includes(search))) return false;

            return true;
        });

        this.renderDonations();
        this.updateDonationCount();
    },

    /**
     * Reset filters
     */
    resetFilters() {
        document.getElementById('status-filter').value = '';
        document.getElementById('type-filter').value = '';
        document.getElementById('project-filter').value = '';
        document.getElementById('search-input').value = '';

        this.filteredDonations = [...this.allDonations];
        this.renderDonations();
        this.updateDonationCount();
    },

    /**
     * Update statistics
     */
    updateStats() {
        // Total cash donations
        const totalCash = this.allDonations
            .filter(d => d.donationType === 'CASH' && d.amount)
            .reduce((sum, d) => sum + parseFloat(d.amount), 0);
        document.getElementById('total-cash').textContent = FormatUtil.formatCurrency(totalCash);

        // Item donations
        const totalItems = this.allDonations.filter(d => d.donationType === 'ITEM').length;
        document.getElementById('total-items').textContent = FormatUtil.formatNumber(totalItems);

        // Service donations
        const totalServices = this.allDonations.filter(d => d.donationType === 'SERVICE').length;
        document.getElementById('total-services').textContent = FormatUtil.formatNumber(totalServices);

        // Pending donations
        const totalPending = this.allDonations.filter(d => d.status === 'PENDING').length;
        document.getElementById('total-pending').textContent = FormatUtil.formatNumber(totalPending);
    },

    /**
     * Update donation count
     */
    updateDonationCount() {
        document.getElementById('donation-count').textContent = this.filteredDonations.length;
    },

    /**
     * Render donations
     */
    renderDonations() {
        const tbody = document.getElementById('donations-tbody');

        if (this.filteredDonations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="no-data">No donations found</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        this.filteredDonations.forEach(donation => {
            const projectName = donation.projectId
                ? (this.allProjects.find(p => p.id === donation.projectId)?.name || 'Unknown')
                : 'General';

            let amountDesc = '';
            if (donation.donationType === 'CASH') {
                amountDesc = FormatUtil.formatCurrency(donation.amount);
            } else if (donation.donationType === 'ITEM') {
                amountDesc = donation.itemDescription || 'Item donation';
            } else {
                amountDesc = donation.itemDescription || 'Service donation';
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <strong>${donation.donorName}</strong><br>
                    <small>${donation.donorEmail || 'No email'}</small>
                </td>
                <td><span class="donation-type type-${donation.donationType.toLowerCase()}">${donation.donationType}</span></td>
                <td>${amountDesc}</td>
                <td><span class="status-badge ${FormatUtil.getStatusClass(donation.status)}">${donation.status}</span></td>
                <td>${projectName}</td>
                <td>${FormatUtil.formatDate(donation.donatedAt)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="AdminDonations.updateStatus(${donation.id})" title="Update Status">
                            🔄
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="AdminDonations.viewDetails(${donation.id})" title="View Details">
                            👁️
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    },

    /**
     * Update donation status
     */
    updateStatus(donationId) {
        const donation = this.allDonations.find(d => d.id === donationId);
        if (!donation) return;

        // Populate modal
        document.getElementById('status-donation-id').value = donation.id;
        document.getElementById('status-donor-name').textContent = donation.donorName;
        document.getElementById('status-current').textContent = donation.status;
        document.getElementById('new-status').value = donation.status;
        document.getElementById('status-notes').value = donation.notes || '';

        // Show modal
        const modal = document.getElementById('status-modal');
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);
    },

    /**
     * Save status update
     */
    async saveStatusUpdate() {
        const donationId = document.getElementById('status-donation-id').value;
        const newStatus = document.getElementById('new-status').value;
        const notes = document.getElementById('status-notes').value.trim();

        try {
            const saveButton = document.getElementById('status-save-btn');
            Loader.showButton(saveButton, 'Updating...');

            const donation = this.allDonations.find(d => d.id == donationId);
            const updateData = {
                ...donation,
                status: newStatus,
                notes: notes,
                receivedAt: newStatus === 'RECEIVED' ? new Date().toISOString() : donation.receivedAt
            };

            await DonationService.update(donationId, updateData);

            // Log activity
            await AdminService.logActivity(
                'UPDATE',
                'DONATION',
                donationId,
                `Updated donation status to ${newStatus}`
            );

            // Send email to donor
            if (donation.donorEmail) {
                let message = '';
                if (newStatus === 'RECEIVED') {
                    message = `Thank you for your donation! We have received your ${donation.donationType.toLowerCase()} donation and will put it to good use.`;
                } else if (newStatus === 'USED') {
                    message = `Thank you for your donation! Your ${donation.donationType.toLowerCase()} donation has been utilized in our programs.`;
                }

                await AdminService.sendEmailNotification(
                    donation.donorEmail,
                    `Donation Status Update - ${newStatus}`,
                    message,
                    'success'
                );
            }

            Loader.hideButton(saveButton);
            Toast.success('Donation status updated successfully');

            this.closeStatusModal();
            this.loadData();

        } catch (error) {
            Loader.hideButton(document.getElementById('status-save-btn'));
            ErrorHandler.handle(error, 'Failed to update donation status');
        }
    },

    /**
     * View donation details
     */
    viewDetails(donationId) {
        const donation = this.allDonations.find(d => d.id === donationId);
        if (!donation) return;

        const projectName = donation.projectId
            ? (this.allProjects.find(p => p.id === donation.projectId)?.name || 'Unknown')
            : 'General Donation';

        let details = `
            <strong>Donor Information:</strong><br>
            Name: ${donation.donorName}<br>
            Email: ${donation.donorEmail || 'Not provided'}<br>
            Phone: ${donation.donorPhone || 'Not provided'}<br>
            Ward: ${donation.donorWard || 'Not specified'}<br><br>

            <strong>Donation Details:</strong><br>
            Type: ${donation.donationType}<br>
            Status: ${donation.status}<br>
            Project: ${projectName}<br>
            Donated: ${FormatUtil.formatDateTime(donation.donatedAt)}<br>
        `;

        if (donation.donationType === 'CASH') {
            details += `Amount: ${FormatUtil.formatCurrency(donation.amount)}<br>`;
        } else if (donation.donationType === 'ITEM') {
            details += `Item: ${donation.itemDescription || 'Not specified'}<br>`;
        } else {
            details += `Service: ${donation.itemDescription || 'Not specified'}<br>`;
        }

        if (donation.receivedAt) {
            details += `Received: ${FormatUtil.formatDateTime(donation.receivedAt)}<br>`;
        }

        if (donation.notes) {
            details += `<br><strong>Notes:</strong><br>${donation.notes}`;
        }

        Modal.alert({
            title: 'Donation Details',
            message: details
        });
    },

    /**
     * Export donations
     */
    exportDonations() {
        try {
            if (this.filteredDonations.length === 0) {
                Toast.warning('No donations to export');
                return;
            }

            AdminService.exportToCSV(this.filteredDonations, 'donations');

            // Log activity
            AdminService.logActivity('EXPORT', 'DONATION', null, 'Exported donations to CSV');

            Toast.success('Donations exported successfully');
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to export donations');
        }
    },

    /**
     * Close status modal
     */
    closeStatusModal() {
        const modal = document.getElementById('status-modal');
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    AdminDonations.init();
});