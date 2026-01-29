const API_BASE = 'http://localhost:8080/api';

// Check authentication
window.addEventListener('load', () => {
    const token = localStorage.getItem('admin_token');

    if (!token) {
        // Redirect to the dedicated admin login page
        window.location.href = 'login.html';
        return;
    }

    // Set user info (if available)
    document.getElementById('userName').textContent = localStorage.getItem('admin_username') || 'Admin User';
    document.getElementById('userRole').textContent = 'Administrator';

    // Load dashboard data
    loadDashboardData();
    updateTime();
    setInterval(updateTime, 1000);
});

function updateTime() {
    const now = new Date();
    document.getElementById('currentTime').textContent = now.toLocaleTimeString();
}

// Use the global adminAPI if available, otherwise fallback to fetch
async function fetchAPI(endpoint) {
    if (typeof adminAPI !== 'undefined') {
        try {
            return await adminAPI.get(endpoint);
        } catch (error) {
            console.error('API Error:', error);
            // If adminAPI throws a 401, it should handle logout/redirect itself
            // But for robustness, we can also check here
            if (error.message.includes('Authentication required')) {
                logout();
            }
            return [];
        }
    }

    const token = localStorage.getItem('admin_token');
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok && response.status === 401) {
            logout();
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return [];
    }
}

async function loadDashboardData() {
    // Load stats
    const projects = await fetchAPI('/v1/projects') || [];
    const volunteers = await fetchAPI('/v1/volunteers') || [];
    const donations = await fetchAPI('/v1/donations') || [];
    const events = await fetchAPI('/v1/events') || [];

    document.getElementById('projectCount').textContent = projects.length;
    document.getElementById('volunteerCount').textContent = volunteers.length;
    document.getElementById('donationCount').textContent = donations.filter(d => d.status === 'PENDING').length;
    document.getElementById('eventCount').textContent = events.length;

    // Load tables
    await loadProjects();
    await loadVolunteers();
    await loadDonations();
    await loadEvents();
}

async function loadProjects() {
    const projects = await fetchAPI('/v1/projects') || [];
    const tbody = document.getElementById('projectsBody');

    if (projects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No projects found</td></tr>';
        return;
    }

    tbody.innerHTML = projects.map(p => `
        <tr>
            <td><strong>${p.name}</strong></td>
            <td>${p.ward}</td>
            <td><span class="status-badge status-${p.status.toLowerCase()}">${p.status}</span></td>
            <td>${p.actualBeneficiaries}/${p.targetBeneficiaries}</td>
            <td>
                <button class="action-btn btn-edit" onclick="editProject(${p.id})">Edit</button>
                <button class="action-btn btn-delete" onclick="deleteProject(${p.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function loadVolunteers() {
    const volunteers = await fetchAPI('/v1/volunteers') || [];
    const tbody = document.getElementById('volunteersBody');

    if (volunteers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No volunteers found</td></tr>';
        return;
    }

    tbody.innerHTML = volunteers.map(v => `
        <tr>
            <td><strong>${v.name}</strong></td>
            <td>${v.email}</td>
            <td>${v.ward}</td>
            <td><span class="status-badge status-${v.status.toLowerCase()}">${v.status}</span></td>
            <td>
                <button class="action-btn btn-edit" onclick="editVolunteer(${v.id})">Edit</button>
                <button class="action-btn btn-delete" onclick="deleteVolunteer(${v.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function loadDonations() {
    const donations = await fetchAPI('/v1/donations') || [];
    const tbody = document.getElementById('donationsBody');

    if (donations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No donations found</td></tr>';
        return;
    }

    tbody.innerHTML = donations.map(d => `
        <tr>
            <td><strong>${d.donorName}</strong></td>
            <td>KES ${d.amount}</td>
            <td>${d.donationType}</td>
            <td><span class="status-badge status-${d.status.toLowerCase()}">${d.status}</span></td>
            <td>${new Date(d.donatedAt).toLocaleDateString()}</td>
            <td>
                <button class="action-btn btn-edit" onclick="editDonation(${d.id})">Edit</button>
                ${d.status === 'PENDING' ? `<button class="action-btn btn-approve" onclick="approveDonation(${d.id})">Approve</button>` : ''}
            </td>
        </tr>
    `).join('');
}

async function loadEvents() {
    const events = await fetchAPI('/v1/events') || [];
    const tbody = document.getElementById('eventsBody');

    if (events.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No events found</td></tr>';
        return;
    }

    tbody.innerHTML = events.map(e => `
        <tr>
            <td><strong>${e.name}</strong></td>
            <td>${e.location}</td>
            <td>${new Date(e.eventDate).toLocaleDateString()}</td>
            <td><span class="status-badge status-${e.status.toLowerCase()}">${e.status}</span></td>
            <td>${e.actualAttendees}/${e.expectedAttendees}</td>
            <td>
                <button class="action-btn btn-edit" onclick="editEvent(${e.id})">Edit</button>
                <button class="action-btn btn-delete" onclick="deleteEvent(${e.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });

    // Remove active class
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName).style.display = 'block';

    // Add active class to clicked link
    // Note: event might not be defined if called programmatically, but here it's onclick
    if (window.event) {
        window.event.target.classList.add('active');
    }

    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'projects': 'Manage Projects',
        'volunteers': 'Volunteer Management',
        'events': 'Event Management',
        'donations': 'Donation Management',
        'users': 'User Management',
        'settings': 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[tabName];
}

// Placeholder functions
function editProject(id) { alert('Edit project ' + id); }
function deleteProject(id) { alert('Delete project ' + id); }
function editVolunteer(id) { alert('Edit volunteer ' + id); }
function deleteVolunteer(id) { alert('Delete volunteer ' + id); }
function editDonation(id) { alert('Edit donation ' + id); }
function approveDonation(id) { alert('Approve donation ' + id); }
function editEvent(id) { alert('Edit event ' + id); }
function deleteEvent(id) { alert('Delete event ' + id); }

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_username');
        localStorage.removeItem('admin_login_time');
        window.location.href = 'login.html'; // Redirect to dedicated admin login page
    }
}

// Expose functions to global scope for onclick handlers
window.switchTab = switchTab;
window.logout = logout;
window.editProject = editProject;
window.deleteProject = deleteProject;
window.editVolunteer = editVolunteer;
window.deleteVolunteer = deleteVolunteer;
window.editDonation = editDonation;
window.approveDonation = approveDonation;
window.editEvent = editEvent;
window.deleteEvent = deleteEvent;
