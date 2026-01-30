document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('admin_token')) {
        window.location.href = 'login.html';
        return;
    }

    loadUsers();

    // Event Listeners
    document.getElementById('role-filter').addEventListener('change', renderUsers);
    document.getElementById('approval-filter').addEventListener('change', loadUsers); // Reloads all users
    document.getElementById('search-input').addEventListener('input', renderUsers);
    document.getElementById('reset-filters').addEventListener('click', resetFiltersAndRender);

    // Modal listeners
    document.getElementById('role-modal-close').addEventListener('click', closeRoleModal);
    document.getElementById('role-cancel-btn').addEventListener('click', closeRoleModal);
    document.getElementById('role-save-btn').addEventListener('click', handleRoleUpdate);
});

let allUsers = [];

async function loadUsers() {
    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = '<tr><td colspan="7">Loading users...</td></tr>';
    const approvalStatus = document.getElementById('approval-filter').value;
    const endpoint = approvalStatus === 'pending' ? '/users/unapproved' : '/users';

    try {
        const users = await adminAPI.get(endpoint);
        allUsers = users || [];
        renderUsers();
        updateStats();
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="7">Error loading users: ${error.message}</td></tr>`;
    }
}

function renderUsers() {
    const tbody = document.getElementById('users-tbody');
    const filters = {
        role: document.getElementById('role-filter').value,
        search: document.getElementById('search-input').value.toLowerCase()
    };

    const filteredUsers = allUsers.filter(u => {
        const searchMatch = !filters.search || u.fullName.toLowerCase().includes(filters.search) || u.email.toLowerCase().includes(filters.search);
        const roleMatch = !filters.role || u.role === filters.role;
        return searchMatch && roleMatch;
    });

    document.getElementById('user-count').textContent = filteredUsers.length;

    if (filteredUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No users match the current filters.</td></tr>';
        return;
    }

    tbody.innerHTML = filteredUsers.map(u => `
        <tr data-id="${u.id}">
            <td><strong>${u.fullName}</strong></td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td>${u.ward || 'N/A'}</td>
            <td><span class="status-badge status-${u.isApproved ? 'active' : 'pending'}">${u.isApproved ? 'Approved' : 'Pending'}</span></td>
            <td>${new Date(u.createdAt).toLocaleDateString()}</td>
            <td class="table-actions">
                ${!u.isApproved ? `<button class="btn btn-sm btn-success" onclick="approveUser(${u.id})">Approve</button>` : ''}
                <button class="btn btn-sm btn-secondary" onclick="openRoleModal(${u.id})">Change Role</button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser(${u.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function updateStats() {
    const totalUsers = allUsers.length;
    const admins = allUsers.filter(u => u.role === 'ADMIN').length;
    const editors = allUsers.filter(u => u.role === 'EDITOR').length;
    const viewers = allUsers.filter(u => u.role === 'VIEWER').length;

    document.getElementById('total-users').textContent = totalUsers;
    document.getElementById('total-admins').textContent = admins;
    document.getElementById('total-editors').textContent = editors;
    document.getElementById('total-viewers').textContent = viewers;

    // This requires a separate call to get pending users count if not already loaded
    adminAPI.get('/users/unapproved').then(pending => {
        document.getElementById('pending-count').textContent = (pending || []).length;
    });
}

function resetFiltersAndRender() {
    document.getElementById('role-filter').value = '';
    document.getElementById('approval-filter').value = 'approved'; // Default to approved
    document.getElementById('search-input').value = '';
    loadUsers();
}

function openRoleModal(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    document.getElementById('role-user-id').value = user.id;
    document.getElementById('role-user-name').textContent = user.fullName;
    document.getElementById('role-current').textContent = user.role;
    document.getElementById('new-role').value = user.role;

    document.getElementById('role-modal').style.display = 'flex';
}

function closeRoleModal() {
    document.getElementById('role-modal').style.display = 'none';
}

async function handleRoleUpdate() {
    const userId = document.getElementById('role-user-id').value;
    const newRole = document.getElementById('new-role').value;
    const user = allUsers.find(u => u.id == userId);

    if (!user) return;

    const payload = { ...user, role: newRole }; // Send a full user object with the updated role

    try {
        await adminAPI.put(`/users/${userId}`, payload);
        alert('User role updated successfully!');
        closeRoleModal();
        loadUsers();
    } catch (error) {
        alert(`Failed to update role: ${error.message}`);
    }
}

async function approveUser(userId) {
    if (!confirm('Are you sure you want to approve this user?')) return;

    try {
        await adminAPI.put(`/users/${userId}/approve`, {});
        alert('User approved successfully!');
        loadUsers();
    } catch (error) {
        alert(`Failed to approve user: ${error.message}`);
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
        await adminAPI.delete(`/users/${userId}`);
        alert('User deleted successfully!');
        loadUsers();
    } catch (error) {
        alert(`Failed to delete user: ${error.message}`);
    }
}
