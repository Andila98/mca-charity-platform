document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('admin_token')) {
        window.location.href = 'login.html';
        return;
    }

    loadEvents();
    loadProjectsForFilter();

    // Event Listeners
    document.getElementById('create-event-btn').addEventListener('click', () => openEventModal());
    document.getElementById('modal-close-btn').addEventListener('click', closeEventModal);
    document.getElementById('modal-cancel-btn').addEventListener('click', closeEventModal);
    document.getElementById('event-form').addEventListener('submit', handleEventSubmit);

    // Filters
    document.getElementById('status-filter').addEventListener('change', renderEvents);
    document.getElementById('time-filter').addEventListener('change', renderEvents);
    document.getElementById('project-filter').addEventListener('change', renderEvents);
    document.getElementById('search-input').addEventListener('input', renderEvents);
    document.getElementById('reset-filters').addEventListener('click', resetFiltersAndRender);
});

let allEvents = [];

async function loadEvents() {
    const tbody = document.getElementById('events-tbody');
    tbody.innerHTML = '<tr><td colspan="7">Loading events...</td></tr>';

    try {
        const events = await adminAPI.get('/events');
        allEvents = events || [];
        renderEvents();
        updateStats();
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="7">Error loading events: ${error.message}</td></tr>`;
    }
}

async function loadProjectsForFilter() {
    const projectFilter = document.getElementById('project-filter');
    const eventProject = document.getElementById('event-project');
    try {
        const projects = await adminAPI.get('/projects');
        if (projects) {
            projects.forEach(p => {
                const option = new Option(p.name, p.id);
                projectFilter.add(option.cloneNode(true));
                eventProject.add(option.cloneNode(true));
            });
        }
    } catch (error) {
        console.error('Failed to load projects for filter:', error);
    }
}

function renderEvents() {
    const tbody = document.getElementById('events-tbody');
    const filters = {
        status: document.getElementById('status-filter').value,
        time: document.getElementById('time-filter').value,
        projectId: document.getElementById('project-filter').value,
        search: document.getElementById('search-input').value.toLowerCase()
    };

    const now = new Date();
    const filteredEvents = allEvents.filter(e => {
        const eventDate = new Date(e.eventDate);
        const searchMatch = !filters.search || e.name.toLowerCase().includes(filters.search);
        const statusMatch = !filters.status || e.status === filters.status;
        const projectMatch = !filters.projectId || (e.project && e.project.id == filters.projectId);
        const timeMatch = !filters.time || (filters.time === 'upcoming' && eventDate > now) || (filters.time === 'past' && eventDate <= now);
        return searchMatch && statusMatch && projectMatch && timeMatch;
    });

    document.getElementById('event-count').textContent = filteredEvents.length;

    if (filteredEvents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No events match the current filters.</td></tr>';
        return;
    }

    tbody.innerHTML = filteredEvents.map(e => `
        <tr data-id="${e.id}">
            <td><strong>${e.name}</strong></td>
            <td>${new Date(e.eventDate).toLocaleString()}</td>
            <td>${e.location}</td>
            <td><span class="status-badge status-${e.status.toLowerCase()}">${e.status}</span></td>
            <td>${e.actualAttendees || 0} / ${e.expectedAttendees || 0}</td>
            <td>${e.project ? e.project.name : 'N/A'}</td>
            <td class="table-actions">
                <button class="btn btn-sm btn-secondary" onclick="editEvent(${e.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteEvent(${e.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function updateStats() {
    const now = new Date();
    const upcoming = allEvents.filter(e => new Date(e.eventDate) > now && e.status !== 'CANCELLED');
    const completed = allEvents.filter(e => e.status === 'COMPLETED');
    const totalAttendees = allEvents.reduce((sum, e) => sum + (e.actualAttendees || 0), 0);

    document.getElementById('total-events').textContent = allEvents.length;
    document.getElementById('upcoming-events').textContent = upcoming.length;
    document.getElementById('completed-events').textContent = completed.length;
    document.getElementById('total-attendees').textContent = totalAttendees;
}

function resetFiltersAndRender() {
    document.getElementById('status-filter').value = '';
    document.getElementById('time-filter').value = '';
    document.getElementById('project-filter').value = '';
    document.getElementById('search-input').value = '';
    renderEvents();
}

function openEventModal() {
    document.getElementById('event-form').reset();
    document.getElementById('event-id').value = '';
    document.getElementById('modal-title').textContent = 'Create Event';
    document.getElementById('event-modal').style.display = 'flex';
}

function closeEventModal() {
    document.getElementById('event-modal').style.display = 'none';
}

async function handleEventSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('event-id').value;
    const adminUserId = localStorage.getItem('admin_user_id');

    if (!adminUserId) {
        alert('Admin user ID not found. Please log in again.');
        return;
    }

    const payload = {
        name: document.getElementById('event-name').value,
        description: document.getElementById('event-description').value,
        eventDate: new Date(document.getElementById('event-date').value).toISOString(),
        location: document.getElementById('event-location').value,
        status: document.getElementById('event-status').value,
        expectedAttendees: parseInt(document.getElementById('expected-attendees').value) || 0,
        actualAttendees: parseInt(document.getElementById('actual-attendees').value) || 0,
        imageUrl: document.getElementById('event-image-url').value,
        organizedById: parseInt(adminUserId),
        projectId: document.getElementById('event-project').value ? parseInt(document.getElementById('event-project').value) : null
    };

    try {
        if (id) {
            await adminAPI.put(`/events/${id}`, payload);
            alert('Event updated successfully!');
        } else {
            await adminAPI.post('/events', payload);
            alert('Event created successfully!');
        }
        closeEventModal();
        loadEvents();
    } catch (error) {
        alert(`Failed to save event: ${error.message}`);
    }
}

async function editEvent(id) {
    try {
        const event = await adminAPI.get(`/events/${id}`);
        document.getElementById('event-id').value = event.id;
        document.getElementById('event-name').value = event.name;
        document.getElementById('event-description').value = event.description;
        document.getElementById('event-date').value = new Date(event.eventDate).toISOString().slice(0, 16);
        document.getElementById('event-location').value = event.location;
        document.getElementById('event-status').value = event.status;
        document.getElementById('expected-attendees').value = event.expectedAttendees;
        document.getElementById('actual-attendees').value = event.actualAttendees;
        document.getElementById('event-image-url').value = event.imageUrl;
        document.getElementById('event-project').value = event.project ? event.project.id : '';

        document.getElementById('modal-title').textContent = 'Edit Event';
        document.getElementById('event-modal').style.display = 'flex';
    } catch (error) {
        alert(`Failed to load event details: ${error.message}`);
    }
}

async function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
        await adminAPI.delete(`/events/${id}`);
        alert('Event deleted successfully');
        loadEvents();
    } catch (error) {
        alert(`Failed to delete event: ${error.message}`);
    }
}
