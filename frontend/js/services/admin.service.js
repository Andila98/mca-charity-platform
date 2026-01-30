/**
 * Admin Service
 * Handles all admin-specific operations
 */

class AdminService {
    /**
     * Get dashboard statistics
     */
    static async getDashboardStats() {
        try {
            const [users, volunteers, projects, events, donations] = await Promise.all([
                apiService.get(API_CONFIG.ENDPOINTS.USERS.BASE),
                apiService.get(API_CONFIG.ENDPOINTS.VOLUNTEERS.BASE),
                apiService.get(API_CONFIG.ENDPOINTS.PROJECTS.BASE),
                apiService.get(API_CONFIG.ENDPOINTS.EVENTS.BASE),
                apiService.get(API_CONFIG.ENDPOINTS.DONATIONS.BASE)
            ]);

            return {
                users: {
                    total: users.length,
                    pending: users.filter(u => !u.isApproved).length,
                    approved: users.filter(u => u.isApproved).length,
                    admins: users.filter(u => u.role === 'ADMIN').length,
                    editors: users.filter(u => u.role === 'EDITOR').length,
                    viewers: users.filter(u => u.role === 'VIEWER').length
                },
                volunteers: {
                    total: volunteers.length,
                    active: volunteers.filter(v => v.status === 'ACTIVE').length,
                    inactive: volunteers.filter(v => v.status === 'INACTIVE').length,
                    recent: volunteers.filter(v => {
                        const regDate = new Date(v.registeredAt);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return regDate >= weekAgo;
                    }).length
                },
                projects: {
                    total: projects.length,
                    planned: projects.filter(p => p.status === 'PLANNED').length,
                    ongoing: projects.filter(p => p.status === 'ONGOING').length,
                    completed: projects.filter(p => p.status === 'COMPLETED').length,
                    totalBeneficiaries: projects.reduce((sum, p) => sum + (p.actualBeneficiaries || 0), 0)
                },
                events: {
                    total: events.length,
                    upcoming: events.filter(e => new Date(e.eventDate) > new Date()).length,
                    ongoing: events.filter(e => e.status === 'ONGOING').length,
                    completed: events.filter(e => e.status === 'COMPLETED').length
                },
                donations: {
                    total: donations.length,
                    pending: donations.filter(d => d.status === 'PENDING').length,
                    received: donations.filter(d => d.status === 'RECEIVED').length,
                    totalAmount: donations
                        .filter(d => d.donationType === 'CASH' && d.amount)
                        .reduce((sum, d) => sum + parseFloat(d.amount), 0)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get recent activity
     */
    static async getRecentActivity(limit = 10) {
        try {
            // Fetch recent items from all entities
            const [projects, events, donations, volunteers] = await Promise.all([
                apiService.get(API_CONFIG.ENDPOINTS.PROJECTS.BASE),
                apiService.get(API_CONFIG.ENDPOINTS.EVENTS.BASE),
                apiService.get(API_CONFIG.ENDPOINTS.DONATIONS.BASE),
                apiService.get(API_CONFIG.ENDPOINTS.VOLUNTEERS.RECENT)
            ]);

            // Combine and sort by date
            const activities = [];

            projects.forEach(p => {
                activities.push({
                    type: 'project',
                    action: 'created',
                    title: p.name,
                    date: p.createdAt,
                    icon: '📁',
                    color: 'blue'
                });
            });

            events.forEach(e => {
                activities.push({
                    type: 'event',
                    action: 'created',
                    title: e.name,
                    date: e.createdAt,
                    icon: '📅',
                    color: 'green'
                });
            });

            donations.forEach(d => {
                activities.push({
                    type: 'donation',
                    action: 'received',
                    title: `${d.donorName} - ${d.donationType}`,
                    date: d.donatedAt,
                    icon: '💰',
                    color: 'yellow'
                });
            });

            volunteers.forEach(v => {
                activities.push({
                    type: 'volunteer',
                    action: 'registered',
                    title: v.name,
                    date: v.registeredAt,
                    icon: '🤝',
                    color: 'purple'
                });
            });

            // Sort by date (newest first) and limit
            return activities
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, limit);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Approve user
     */
    static async approveUser(userId) {
        try {
            return await apiService.post(API_CONFIG.ENDPOINTS.USERS.APPROVE(userId));
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update user role
     */
    static async updateUserRole(userId, role) {
        try {
            return await apiService.put(API_CONFIG.ENDPOINTS.USERS.BY_ID(userId), { role });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete user
     */
    static async deleteUser(userId) {
        try {
            return await apiService.delete(API_CONFIG.ENDPOINTS.USERS.BY_ID(userId));
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get pending approvals
     */
    static async getPendingApprovals() {
        try {
            return await apiService.get(API_CONFIG.ENDPOINTS.USERS.PENDING_APPROVAL);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Backup data
     */
    static async backupData() {
        try {
            const [users, volunteers, projects, events, donations] = await Promise.all([
                apiService.get(API_CONFIG.ENDPOINTS.USERS.BASE),
                apiService.get(API_CONFIG.ENDPOINTS.VOLUNTEERS.BASE),
                apiService.get(API_CONFIG.ENDPOINTS.PROJECTS.BASE),
                apiService.get(API_CONFIG.ENDPOINTS.EVENTS.BASE),
                apiService.get(API_CONFIG.ENDPOINTS.DONATIONS.BASE)
            ]);

            const backup = {
                timestamp: new Date().toISOString(),
                version: '1.0',
                data: {
                    users,
                    volunteers,
                    projects,
                    events,
                    donations
                }
            };

            // Create downloadable JSON file
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `charity-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return backup;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Log activity
     */
    static async logActivity(action, entityType, entityId, details) {
        try {
            const user = authService.getCurrentUser();
            const log = {
                userId: user?.id,
                userName: user?.fullName,
                action,
                entityType,
                entityId,
                details,
                timestamp: new Date().toISOString(),
                ipAddress: await this.getIpAddress()
            };

            // Store in localStorage (in production, this would be sent to backend)
            const logs = StorageUtil.get('activity_logs') || [];
            logs.unshift(log);
            // Keep only last 1000 logs
            if (logs.length > 1000) logs.splice(1000);
            StorageUtil.set('activity_logs', logs);

            return log;
        } catch (error) {
            console.error('Failed to log activity:', error);
        }
    }

    /**
     * Get activity logs
     */
    static getActivityLogs(limit = 50) {
        const logs = StorageUtil.get('activity_logs') || [];
        return logs.slice(0, limit);
    }

    /**
     * Get IP address (placeholder)
     */
    static async getIpAddress() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }

    /**
     * Send email notification
     */
    static async sendEmailNotification(to, subject, message, type = 'info') {
        try {
            // In production, this would call a backend email service
            const notification = {
                to,
                subject,
                message,
                type,
                sentAt: new Date().toISOString(),
                status: 'sent'
            };

            // Store in localStorage for demo
            const notifications = StorageUtil.get('email_notifications') || [];
            notifications.unshift(notification);
            if (notifications.length > 100) notifications.splice(100);
            StorageUtil.set('email_notifications', notifications);

            console.log('Email notification sent:', notification);
            return notification;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get email notifications
     */
    static getEmailNotifications(limit = 50) {
        const notifications = StorageUtil.get('email_notifications') || [];
        return notifications.slice(0, limit);
    }

    /**
     * Export data to CSV
     */
    static exportToCSV(data, filename) {
        if (!data || data.length === 0) {
            throw new Error('No data to export');
        }

        // Get headers from first object
        const headers = Object.keys(data[0]);

        // Create CSV content
        let csv = headers.join(',') + '\n';

        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                // Handle commas and quotes in values
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            });
            csv += values.join(',') + '\n';
        });

        // Download file
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdminService };
}