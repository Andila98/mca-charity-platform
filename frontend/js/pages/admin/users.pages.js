/**
 * Admin Users Management Page
 * Full user management with approval, role changes, and deletion
 */

const AdminUsers = {
    allUsers: [],
    filteredUsers: [],

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
        if (!AuthService.requireAdmin()) return;

        this.populateWardDropdown();
        this.setupEventListeners();
        this.loadUsers();
    },

    /**
     * Populate ward dropdown
     */
    populateWardDropdown() {
        const select = document.getElementById('ward-filter');

        this.WARDS.forEach(ward => {
            const option = document.createElement('option');
            option.value = ward;
            option.textContent = ward;
            select.appendChild(option);
        });
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

        // Pending approvals button
        document.getElementById('pending-approvals-btn').addEventListener('click', () => {
            this.showPendingOnly();
        });

        // Filters
        document.getElementById('role-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('approval-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('ward-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('search-input').addEventListener('input', () => this.applyFilters());
        document.getElementById('reset-filters').addEventListener('click', () => this.resetFilters());

        // Role modal
        document.getElementById('role-modal-close').addEventListener('click', () => this.closeRoleModal());
        document.getElementById('role-cancel-btn').addEventListener('click', () => this.closeRoleModal());
        document.getElementById('role-save-btn').addEventListener('click', () => this.saveRoleChange());
    },

    /**
     * Load users
     */
    async loadUsers() {
        try {
            Loader.show('Loading users...');

            this.allUsers = await apiService.get(API_CONFIG.ENDPOINTS.USERS.BASE);
            this.filteredUsers = [...this.allUsers];

            this.renderUsers();
            this.updateStats();
            this.updateUserCount();
            this.updatePendingCount();

            Loader.hide();
        } catch (error) {
            Loader.hide();
            ErrorHandler.handle(error, 'Failed to load users');
        }
    },

    /**
     * Apply filters
     */
    applyFilters() {
        const role = document.getElementById('role-filter').value;
        const approval = document.getElementById('approval-filter').value;
        const ward = document.getElementById('ward-filter').value;
        const search = document.getElementById('search-input').value.toLowerCase();

        this.filteredUsers = this.allUsers.filter(user => {
            // Role filter
            if (role && user.role !== role) return false;

            // Approval filter
            if (approval === 'approved' && !user.isApproved) return false;
            if (approval === 'pending' && user.isApproved) return false;

            // Ward filter
            if (ward && user.ward !== ward) return false;

            // Search filter
            if (search &&
                !user.fullName.toLowerCase().includes(search) &&
                !user.email.toLowerCase().includes(search)) return false;

            return true;
        });

        this.renderUsers();
        this.updateUserCount();
    },

    /**
     * Reset filters
     */
    resetFilters() {
        document.getElementById('role-filter').value = '';
        document.getElementById('approval-filter').value = '';
        document.getElementById('ward-filter').value = '';
        document.getElementById('search-input').value = '';

        this.filteredUsers = [...this.allUsers];
        this.renderUsers();
        this.updateUserCount();
    },

    /**
     * Show pending only
     */
    showPendingOnly() {
        document.getElementById('approval-filter').value = 'pending';
        this.applyFilters();
    },

    /**
     * Update statistics
     */
    updateStats() {
        document.getElementById('total-users').textContent = FormatUtil.formatNumber(this.allUsers.length);
        document.getElementById('total-admins').textContent = this.allUsers.filter(u => u.role === 'ADMIN').length;
        document.getElementById('total-editors').textContent = this.allUsers.filter(u => u.role === 'EDITOR').length;
        document.getElementById('total-viewers').textContent = this.allUsers.filter(u => u.role === 'VIEWER').length;
    },

    /**
     * Update user count
     */
    updateUserCount() {
        document.getElementById('user-count').textContent = this.filteredUsers.length;
    },

    /**
     * Update pending count
     */
    updatePendingCount() {
        const pending = this.allUsers.filter(u => !u.isApproved).length;
        document.getElementById('pending-count').textContent = pending;
    },

    /**
     * Render users
     */
    renderUsers() {
        const tbody = document.getElementById('users-tbody');

        if (this.filteredUsers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="no-data">No users found</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        this.filteredUsers.forEach(user => {
            const approvalStatus = user.isApproved
                ? '<span class="status-badge status-success">Approved</span>'
                : '<span class="status-badge status-warning">Pending</span>';

            const row = document.createElement('tr');
            row.className = user.isApproved ? '' : 'pending-approval';
            row.innerHTML = `
                <td><strong>${user.fullName}</strong></td>
                <td>${user.email}</td>
                <td><span class="role-badge role-${user.role.toLowerCase()}">${user.role}</span></td>
                <td>${user.ward || 'Not specified'}</td>
                <td>${approvalStatus}</td>
                <td>${FormatUtil.formatDate(user.createdAt)}</td>
                <td>
                    <div class="action-buttons">
                        ${!user.isApproved ? `
                            <button class="btn btn-sm btn-success" onclick="AdminUsers.approveUser(${user.id}, '${user.fullName}')" title="Approve">
                                ✓
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-primary" onclick="AdminUsers.changeRole(${user.id})" title="Change Role">
                            🔄
                        </button>
                        <button class="btn btn-sm btn-error" onclick="AdminUsers.deleteUser(${user.id}, '${user.fullName}')" title="Delete">
                            🗑️
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
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
            const user = this.allUsers.find(u => u.id === userId);
            if (user && user.email) {
                await AdminService.sendEmailNotification(
                    user.email,
                    'Account Approved - Charity Platform',
                    `Hello ${userName},\n\nYour account has been approved! You can now login to the platform and start contributing.\n\nThank you for joining us!`,
                    'success'
                );
            }

            Loader.hide();
            Toast.success('User approved successfully');

            this.loadUsers();

        } catch (error) {
            Loader.hide();
            ErrorHandler.handle(error, 'Failed to approve user');
        }
    },

    /**
     * Change user role
     */
    changeRole(userId) {
        const user = this.allUsers.find(u => u.id === userId);
        if (!user) return;

        // Populate modal
        document.getElementById('role-user-id').value = user.id;
        document.getElementById('role-user-name').textContent = user.fullName;
        document.getElementById('role-current').textContent = user.role;
        document.getElementById('new-role').value = user.role;

        // Show modal
        const modal = document.getElementById('role-modal');
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);
    },

    /**
     * Save role change
     */
    async saveRoleChange() {
        const userId = document.getElementById('role-user-id').value;
        const newRole = document.getElementById('new-role').value;
        const user = this.allUsers.find(u => u.id == userId);

        if (!user || user.role === newRole) {
            Toast.warning('No changes to save');
            this.closeRoleModal();
            return;
        }

        try {
            const saveButton = document.getElementById('role-save-btn');
            Loader.showButton(saveButton, 'Updating...');

            await AdminService.updateUserRole(userId, newRole);

            // Log activity
            await AdminService.logActivity(
                'UPDATE',
                'USER',
                userId,
                `Changed user role from ${user.role} to ${newRole}`
            );

            // Send email notification
            if (user.email) {
                await AdminService.sendEmailNotification(
                    user.email,
                    'Role Update - Charity Platform',
                    `Hello ${user.fullName},\n\nYour role has been updated to ${newRole}. Your new permissions are now active.\n\nThank you!`,
                    'info'
                );
            }

            Loader.hideButton(saveButton);
            Toast.success('User role updated successfully');

            this.closeRoleModal();
            this.loadUsers();

        } catch (error) {
            Loader.hideButton(document.getElementById('role-save-btn'));
            ErrorHandler.handle(error, 'Failed to update user role');
        }
    },

    /**
     * Delete user
     */
    async deleteUser(userId, userName) {
        const currentUser = AuthService.getCurrentUser();

        // Prevent self-deletion
        if (currentUser.id === userId) {
            Toast.error('You cannot delete your own account');
            return;
        }

        const confirmed = await new Promise(resolve => {
            Modal.confirm({
                title: 'Delete User',
                message: `Are you sure you want to delete ${userName}? This action cannot be undone and will remove all their data.`,
                confirmText: 'Delete',
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        });

        if (!confirmed) return;

        try {
            Loader.show('Deleting user...');

            await AdminService.deleteUser(userId);

            // Log activity
            await AdminService.logActivity('DELETE', 'USER', userId, `Deleted user: ${userName}`);

            Loader.hide();
            Toast.success('User deleted successfully');

            this.loadUsers();

        } catch (error) {
            Loader.hide();
            ErrorHandler.handle(error, 'Failed to delete user');
        }
    },

    /**
     * Close role modal
     */
    closeRoleModal() {
        const modal = document.getElementById('role-modal');
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    AdminUsers.init();
});