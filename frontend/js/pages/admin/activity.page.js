/**
 * Activity Logs Page
 * View and manage system activity logs
 */

const ActivityLogsPage = {
    allLogs: [],
    filteredLogs: [],
    allNotifications: [],

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

        // Export logs
        document.getElementById('export-logs-btn').addEventListener('click', () => {
            this.exportLogs();
        });

        // Clear logs
        document.getElementById('clear-logs-btn').addEventListener('click', () => {
            this.clearLogs();
        });

        // Filters
        document.getElementById('action-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('entity-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('date-from').addEventListener('change', () => this.applyFilters());
        document.getElementById('date-to').addEventListener('change', () => this.applyFilters());
        document.getElementById('reset-filters').addEventListener('click', () => this.resetFilters());
    },

    /**
     * Load data
     */
    async loadData() {
        try {
            Loader.show('Loading activity logs...');

            // Get logs from localStorage
            this.allLogs = AdminService.getActivityLogs(1000);
            this.filteredLogs = [...this.allLogs];

            // Get notifications
            this.allNotifications = AdminService.getEmailNotifications(100);

            this.renderLogs();
            this.renderNotifications();
            this.updateCounts();

            Loader.hide();
        } catch (error) {
            Loader.hide();
            ErrorHandler.handle(error, 'Failed to load activity logs');
        }
    },

    /**
     * Apply filters
     */
    applyFilters() {
        const action = document.getElementById('action-filter').value;
        const entity = document.getElementById('entity-filter').value;
        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;

        this.filteredLogs = this.allLogs.filter(log => {
            // Action filter
            if (action && log.action !== action) return false;

            // Entity filter
            if (entity && log.entityType !== entity) return false;

            // Date filters
            if (dateFrom) {
                const logDate = new Date(log.timestamp);
                const fromDate = new Date(dateFrom);
                if (logDate < fromDate) return false;
            }

            if (dateTo) {
                const logDate = new Date(log.timestamp);
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                if (logDate > toDate) return false;
            }

            return true;
        });

        this.renderLogs();
        this.updateCounts();
    },

    /**
     * Reset filters
     */
    resetFilters() {
        document.getElementById('action-filter').value = '';
        document.getElementById('entity-filter').value = '';
        document.getElementById('date-from').value = '';
        document.getElementById('date-to').value = '';

        this.filteredLogs = [...this.allLogs];
        this.renderLogs();
        this.updateCounts();
    },

    /**
     * Update counts
     */
    updateCounts() {
        document.getElementById('log-count').textContent = this.filteredLogs.length;
        document.getElementById('notification-count').textContent = this.allNotifications.length;
    },

    /**
     * Render logs
     */
    renderLogs() {
        const tbody = document.getElementById('logs-tbody');

        if (this.filteredLogs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-data">No activity logs found</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        this.filteredLogs.forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${FormatUtil.formatDateTime(log.timestamp)}</td>
                <td><strong>${log.userName || 'System'}</strong></td>
                <td><span class="action-badge action-${log.action.toLowerCase()}">${log.action}</span></td>
                <td>${log.entityType || 'N/A'}</td>
                <td>${log.details || 'No details'}</td>
                <td>${log.ipAddress || 'Unknown'}</td>
            `;
            tbody.appendChild(row);
        });
    },

    /**
     * Render notifications
     */
    renderNotifications() {
        const tbody = document.getElementById('notifications-tbody');

        if (this.allNotifications.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-data">No email notifications sent</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        this.allNotifications.forEach(notification => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${FormatUtil.formatDateTime(notification.sentAt)}</td>
                <td>${notification.to}</td>
                <td>${notification.subject}</td>
                <td><span class="notification-type type-${notification.type}">${FormatUtil.capitalizeFirst(notification.type)}</span></td>
                <td><span class="status-badge status-${notification.status}">${FormatUtil.capitalizeFirst(notification.status)}</span></td>
            `;
            tbody.appendChild(row);
        });
    },

    /**
     * Export logs
     */
    exportLogs() {
        try {
            if (this.filteredLogs.length === 0) {
                Toast.warning('No logs to export');
                return;
            }

            AdminService.exportToCSV(this.filteredLogs, 'activity-logs');

            // Log the export action
            AdminService.logActivity('EXPORT', 'SYSTEM', null, 'Exported activity logs');

            Toast.success('Activity logs exported successfully');
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to export logs');
        }
    },

    /**
     * Clear logs
     */
    clearLogs() {
        Modal.confirm({
            title: 'Clear Activity Logs',
            message: 'Are you sure you want to clear all activity logs? This action cannot be undone.',
            confirmText: 'Clear Logs',
            onConfirm: async () => {
                try {
                    // Keep only the last 10 logs
                    const recentLogs = this.allLogs.slice(0, 10);
                    StorageUtil.setItem('activity_logs', recentLogs);

                    // Log the clear action before clearing
                    await AdminService.logActivity('CLEAR_LOGS', 'SYSTEM', null, 'Cleared activity logs');

                    Toast.success('Activity logs cleared successfully');
                    this.loadData();
                } catch (error) {
                    ErrorHandler.handle(error, 'Failed to clear logs');
                }
            }
        });
    }
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    ActivityLogsPage.init();
});