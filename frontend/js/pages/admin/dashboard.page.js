/**
 * Admin Dashboard Page
 * Main admin dashboard with statistics and overview
 */

const AdminDashboard = {
    stats: null,

    /**
     * Initialize dashboard
     */
    init() {
        // Check admin authentication
        authService.requireAdmin();

        this.loadUserInfo();
        this.setupEventListeners();
        this.loadDashboardData();
        this.setupSidebarToggle();
    },

    /**
     * Load user information
     */
    loadUserInfo() {
        const user = authService.getCurrentUser();
        if (user) {
            document.getElementById('user-name').textContent = user.fullName;
            document.getElementById('user-role').textContent = user.role;
        }
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Backup button
        document.getElementById('backup-btn').addEventListener('click', () => {
            this.handleBackup();
        });

        // Export button
        document.getElementById('export-btn').addEventListener('click', () => {
            this.handleExport();
        });
    },

    /**
     * Setup sidebar toggle for mobile
     */
    setupSidebarToggle() {
        const sidebar = document.getElementById('admin-sidebar');
        const toggle = document.getElementById('sidebar-toggle');
        
        if (toggle) {
            toggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
            });
        }
    },

    /**
     * Load dashboard data
     */
    async loadDashboardData() {
        try {
            Loader.show('Loading dashboard...');

            // Load statistics
            this.stats = await AdminService.getDashboardStats();
            this.renderStatistics();

            // Load pending approvals
            const pendingUsers = await AdminService.getPendingApprovals();
            this.renderPendingApprovals(pendingUsers);

            // Load recent activity
            const activities = await AdminService.getRecentActivity(10);
            this.renderRecentActivity(activities);

            Loader.hide();

        } catch (error) {
            Loader.hide();
            ErrorHandler.handle(error, 'Failed to load dashboard data');
        }
    },

    /**
     * Render statistics
     */
    renderStatistics() {
        // Users
        document.getElementById('total-users').textContent = 
            FormatUtil.formatNumber(this.stats.users.total);
        document.getElementById('pending-users').textContent = 
            `${this.stats.users.pending} pending approval`;

        // Projects
        document.getElementById('total-projects').textContent = 
            FormatUtil.formatNumber(this.stats.projects.total);
        document.getElementById('ongoing-projects').textContent = 
            `${this.stats.projects.ongoing} ongoing`;

        // Donations
        document.getElementById('total-donations').textContent = 
            FormatUtil.formatCurrency(this.stats.donations.totalAmount);
        document.getElementById('pending-donations').textContent = 
            `${this.stats.donations.pending} pending`;

        // Volunteers
        document.getElementById('total-volunteers').textContent = 
            FormatUtil.formatNumber(this.stats.volunteers.total);
        document.getElementById('active-volunteers').textContent = 
            `${this.stats.volunteers.active} active`;
    },

    /**
     * Render pending approvals
     */
    renderPendingApprovals(users) {
        const container = document.getElementById('pending-approvals-list');

        if (!users || users.length === 0) {
            container.innerHTML = '<p class="no-data">No pending approvals</p>';
            return;
        }

        container.innerHTML = '';
        users.slice(0, 5).forEach(user => {
            const item = document.createElement('div');
            item.className = 'approval-item';
            item.innerHTML = `
                <div class="approval-info">
                    <strong>${user.fullName}</strong>
                    <span>${user.email}</span>
                    <small>${FormatUtil.formatRelativeTime(user.createdAt)}</small>
                </div>
                <div class="approval-actions">
                    <button class="btn btn-sm btn-success" onclick="AdminDashboard.approveUser(${user.id}, '${user.fullName}')">
                        Approve
                    </button>
                    <button class="btn btn-sm btn-error" onclick="AdminDashboard.rejectUser(${user.id})">
                        Reject
                    </button>
                </div>
            `;
            container.appendChild(item);
        });
    },

    /**
     * Render recent activity
     */
    renderRecentActivity(activities) {
        const container = document.getElementById('recent-activity-list');

        if (!activities || activities.length === 0) {
            container.innerHTML = '<p class="no-data">No recent activity</p>';
            return;
        }

        container.innerHTML = '';
        activities.forEach(activity => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.innerHTML = `
                <span class="activity-icon ${activity.color}">${activity.icon}</span>
                <div class="activity-details">
                    <strong>${activity.title}</strong>
                    <span>${activity.action}</span>
                    <small>${FormatUtil.formatRelativeTime(activity.date)}</small>
                </div>
            `;
            container.appendChild(item);
        });
    },

    /**
     * Approve user
     */
    async approveUser(userId, userName) {
        const confirmed = await new Promise(resolve => {
            Modal.confirm({
                title: 'Approve User',
                message: `Are you sure you want to approve ${userName}?`,
                confirmText: 'Approve',
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        });

        if (!confirmed) return;

        try {
            Loader.show('Approving user...');
            await AdminService.approveUser(userId);
            
            // Log activity
            await AdminService.logActivity('APPROVE_USER', 'USER', userId, `Approved user: ${userName}`);
            
            // Send email notification
            const user = await apiService.get(API_CONFIG.ENDPOINTS.USERS.BY_ID(userId));
            await AdminService.sendEmailNotification(
                user.email,
                'Account Approved',
                `Hello ${userName},\n\nYour account has been approved. You can now login to the platform.`,
                'success'
            );

            Loader.hide();
            Toast.success('User approved successfully');
            
            // Reload data
            this.loadDashboardData();

        } catch (error) {
            Loader.hide();
            ErrorHandler.handle(error, 'Failed to approve user');
        }
    },

    /**
     * Reject user
     */
    async rejectUser(userId) {
        const confirmed = await new Promise(resolve => {
            Modal.confirm({
                title: 'Reject User',
                message: 'Are you sure you want to reject this user? This will delete their account.',
                confirmText: 'Reject',
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        });

        if (!confirmed) return;

        try {
            Loader.show('Rejecting user...');
            await AdminService.deleteUser(userId);
            
            // Log activity
            await AdminService.logActivity('REJECT_USER', 'USER', userId, 'Rejected user registration');

            Loader.hide();
            Toast.success('User rejected successfully');
            
            // Reload data
            this.loadDashboardData();

        } catch (error) {
            Loader.hide();
            ErrorHandler.handle(error, 'Failed to reject user');
        }
    },

    /**
     * Handle backup
     */
    async handleBackup() {
        try {
            Loader.show('Creating backup...');
            
            await AdminService.backupData();
            
            // Log activity
            await AdminService.logActivity('BACKUP', 'SYSTEM', null, 'Created system backup');

            Loader.hide();
            Toast.success('Backup created successfully');

        } catch (error) {
            Loader.hide();
            ErrorHandler.handle(error, 'Failed to create backup');
        }
    },

    /**
     * Handle export
     */
    handleExport() {
        Modal.show({
            title: 'Export Reports',
            content: `
                <p>Select data to export:</p>
                <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
                    <label style="display: flex; align-items-center; gap: 0.5rem;">
                        <input type="checkbox" id="export-users" checked>
                        <span>Users</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" id="export-projects" checked>
                        <span>Projects</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" id="export-events" checked>
                        <span>Events</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" id="export-donations" checked>
                        <span>Donations</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" id="export-volunteers" checked>
                        <span>Volunteers</span>
                    </label>
                </div>
            `,
            buttons: [
                {
                    id: 'cancel-export',
                    text: 'Cancel',
                    class: 'btn-secondary',
                    onClick: () => Modal.hide()
                },
                {
                    id: 'confirm-export',
                    text: 'Export',
                    class: 'btn-primary',
                    onClick: () => this.executeExport()
                }
            ]
        });
    },

    /**
     * Execute export
     */
    async executeExport() {
        Modal.hide();
        
        try {
            Loader.show('Exporting data...');

            const exportUsers = document.getElementById('export-users')?.checked;
            const exportProjects = document.getElementById('export-projects')?.checked;
            const exportEvents = document.getElementById('export-events')?.checked;
            const exportDonations = document.getElementById('export-donations')?.checked;
            const exportVolunteers = document.getElementById('export-volunteers')?.checked;

            if (exportUsers) {
                const users = await apiService.get(API_CONFIG.ENDPOINTS.USERS.BASE);
                AdminService.exportToCSV(users, 'users');
            }

            if (exportProjects) {
                const projects = await apiService.get(API_CONFIG.ENDPOINTS.PROJECTS.BASE);
                AdminService.exportToCSV(projects, 'projects');
            }

            if (exportEvents) {
                const events = await apiService.get(API_CONFIG.ENDPOINTS.EVENTS.BASE);
                AdminService.exportToCSV(events, 'events');
            }

            if (exportDonations) {
                const donations = await apiService.get(API_CONFIG.ENDPOINTS.DONATIONS.BASE);
                AdminService.exportToCSV(donations, 'donations');
            }

            if (exportVolunteers) {
                const volunteers = await apiService.get(API_CONFIG.ENDPOINTS.VOLUNTEERS.BASE);
                AdminService.exportToCSV(volunteers, 'volunteers');
            }

            // Log activity
            await AdminService.logActivity('EXPORT', 'SYSTEM', null, 'Exported data to CSV');

            Loader.hide();
            Toast.success('Data exported successfully');

        } catch (error) {
            Loader.hide();
            ErrorHandler.handle(error, 'Failed to export data');
        }
    },

    /**
     * Handle logout
     */
    handleLogout() {
        Modal.confirm({
            title: 'Logout',
            message: 'Are you sure you want to logout?',
            confirmText: 'Logout',
            onConfirm: () => {
                authService.logout();
                window.location.href = '../login.html';
            }
        });
    }
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    AdminDashboard.init();
});