document.addEventListener('DOMContentLoaded', () => {
    // Check for authentication
    if (!localStorage.getItem('admin_token')) {
        window.location.href = 'login.html';
        return;
    }

    // Initial data load
    loadDonations();
    loadProjectsForFilter();

    // Setup event listeners
    document.getElementById('status-filter').addEventListener('change', () => loadDonations());
    document.getElementById('type-filter').addEventListener('change', () => loadDonations());
    document.getElementById('project-filter').addEventListener('change', () => loadDonations());
    document.getElementById('search-input').addEventListener('input', () => loadDonations());
    document.getElementById('reset-filters').addEventListener('click', resetFiltersAndLoad);

    // Modal listeners
    document.getElementById('status-modal-close').addEventListener('click', closeStatusModal);
    document.getElementById('status-cancel-btn').addEventListener('click', closeStatusModal);
    document.getElementById('status-save-btn').addEventListener('click', handleStatusUpdate);
});

let allDonations = []; // Cache for client-side filtering

async function loadDonations() {
    const tbody = document.getElementById('donations-tbody');
    tbody.innerHTML = '<tr><td colspan="7">Loading donations...</td></tr>';

    try {
        const donations = await adminAPI.get('/donations');
        allDonations = donations || [];
        renderDonations();
        updateStats();
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="7">Error loading donations: ${error.message}</td></tr>`;
    }
}

async function loadProjectsForFilter() {
    const projectFilter = document.getElementById('project-filter');
    try {
        const projects = await adminAPI.get('/projects');
        if (projects) {
            projects.forEach(p => {
                const option = new Option(p.name, p.id);
                projectFilter.add(option);
            });
        }
    } catch (error) {
        console.error('Failed to load projects for filter:', error);
    }
}

function renderDonations() {
    const tbody = document.getElementById('donations-tbody');
    const filters = {
        status: document.getElementById('status-filter').value,
        type: document.getElementById('type-filter').value,
        projectId: document.getElementById('project-filter').value,
        search: document.getElementById('search-input').value.toLowerCase()
    };

    const filteredDonations = allDonations.filter(d => {
        const searchMatch = !filters.search || d.donorName.toLowerCase().includes(filters.search);
        const statusMatch = !filters.status || d.status === filters.status;
        const typeMatch = !filters.type || d.donationType === filters.type;
        const projectMatch = !filters.projectId || (d.project && d.project.id == filters.projectId);
        return searchMatch && statusMatch && typeMatch && projectMatch;
    });

    document.getElementById('donation-count').textContent = filteredDonations.length;

    if (filteredDonations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No donations match the current filters.</td></tr>';
        return;
    }

    tbody.innerHTML = filteredDonations.map(d => `
        <tr data-id="${d.id}">
            <td><strong>${d.donorName}</strong></td>
            <td>${d.donationType}</td>
            <td>${d.donationType === 'CASH' ? `KES ${d.amount.toLocaleString()}` : d.description}</td>
            <td><span class="status-badge status-${d.status.toLowerCase()}">${d.status}</span></td>
            <td>${d.project ? d.project.name : 'N/A'}</td>
            <td>${new Date(d.donatedAt).toLocaleDateString()}</td>
            <td class="table-actions">
                <button class="btn btn-sm btn-secondary" onclick="openStatusModal(${d.id})">Update Status</button>
            </td>
        </tr>
    `).join('');
}

function updateStats() {
    const totalCash = allDonations
        .filter(d => d.donationType === 'CASH' && d.status !== 'PENDING')
        .reduce((sum, d) => sum + d.amount, 0);

    const totalItems = allDonations.filter(d => d.donationType === 'ITEM').length;
    const totalServices = allDonations.filter(d => d.donationType === 'SERVICE').length;
    const totalPending = allDonations.filter(d => d.status === 'PENDING').length;

    document.getElementById('total-cash').textContent = `KES ${totalCash.toLocaleString()}`;
    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('total-services').textContent = totalServices;
    document.getElementById('total-pending').textContent = totalPending;
}

function resetFiltersAndLoad() {
    document.getElementById('status-filter').value = '';
    document.getElementById('type-filter').value = '';
    document.getElementById('project-filter').value = '';
    document.getElementById('search-input').value = '';
    renderDonations();
}

function openStatusModal(donationId) {
    const donation = allDonations.find(d => d.id === donationId);
    if (!donation) return;

    document.getElementById('status-donation-id').value = donation.id;
    document.getElementById('status-donor-name').textContent = donation.donorName;
    document.getElementById('status-current').textContent = donation.status;
    document.getElementById('new-status').value = donation.status;
    document.getElementById('status-notes').value = '';

    document.getElementById('status-modal').style.display = 'flex';
}

function closeStatusModal() {
    document.getElementById('status-modal').style.display = 'none';
}

async function handleStatusUpdate() {
    const donationId = document.getElementById('status-donation-id').value;
    const newStatus = document.getElementById('new-status').value;
    const notes = document.getElementById('status-notes').value; // Notes are for logging, not part of the core update DTO

    const donation = allDonations.find(d => d.id == donationId);
    if (!donation) return;

    // The backend PUT /donations/{id} expects a DonationRequest object
    const updatePayload = {
        donorName: donation.donorName,
        email: donation.email,
        donationType: donation.donationType,
        amount: donation.amount,
        description: donation.description,
        status: newStatus, // The only changed field
        projectId: donation.project ? donation.project.id : null
    };

    try {
        await adminAPI.put(`/donations/${donationId}`, updatePayload);
        alert('Status updated successfully!');
        closeStatusModal();
        loadDonations(); // Reload all data to reflect changes
    } catch (error) {
        alert(`Failed to update status: ${error.message}`);
    }
}
