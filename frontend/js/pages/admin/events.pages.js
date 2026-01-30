/**
 * Admin Events Management Page
 * Full CRUD operations for events
 */

const AdminEvents = {
    allEvents: [],
    filteredEvents: [],
    allProjects: [],
    editingEvent: null,

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

        // Create event button
        document.getElementById('create-event-btn').addEventListener('click', () => {
            this.openCreateModal();
        });

        // Filters
        document.getElementById('status-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('time-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('project-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('search-input').addEventListener('input', () => this.applyFilters());
        document.getElementById('reset-filters').addEventListener('click', () => this.resetFilters());

        // Modal buttons
        document.getElementById('modal-close-btn').addEventListener('click', () => this.closeModal());
        document.getElementById('modal-cancel-btn').addEventListener('click', () => this.closeModal());
        document.getElementById('modal-save-btn').addEventListener('click', () => this.saveEvent());
    },

    /**
     * Load data
     */
    async loadData() {
        try {
            Loader.show('Loading events...');

            // Load events and projects
            [this.allEvents, this.allProjects] = await Promise.all([
                EventService.getAll(),
                ProjectService.getAll()
            ]);

            this.filteredEvents = [...this.allEvents];

            this.populateProjectDropdowns();
            this.renderEvents();
            this.updateEventCount();

            Loader.hide();
        } catch (error) {
            Loader.hide();
            ErrorHandler.handle(error, 'Failed to load events');
        }
    },

    /**
     * Populate project dropdowns
     */
    populateProjectDropdowns() {
        const selects = ['project-filter', 'event-project'];

        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                // Clear existing options (except first one)
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
            }
        });
    },

    /**
     * Apply filters
     */
    applyFilters() {
        const status = document.getElementById('status-filter').value;
        const time = document.getElementById('time-filter').value;
        const projectId = document.getElementById('project-filter').value;
        const search = document.getElementById('search-input').value.toLowerCase();
        const now = new Date();

        this.filteredEvents = this.allEvents.filter(event => {
            // Status filter
            if (status && event.status !== status) return false;

            // Time filter
            if (time) {
                const eventDate = new Date(event.eventDate);
                if (time === 'upcoming' && eventDate < now) return false;
                if (time === 'past' && eventDate >= now) return false;
            }

            // Project filter
            if (projectId) {
                if (!event.projectId || event.projectId.toString() !== projectId) return false;
            }

            // Search filter
            if (search &&
                !event.name.toLowerCase().includes(search) &&
                !event.description.toLowerCase().includes(search) &&
                !event.location.toLowerCase().includes(search)) return false;

            return true;
        });

        this.renderEvents();
        this.updateEventCount();
    },

    /**
     * Reset filters
     */
    resetFilters() {
        document.getElementById('status-filter').value = '';
        document.getElementById('time-filter').value = '';
        document.getElementById('project-filter').value = '';
        document.getElementById('search-input').value = '';

        this.filteredEvents = [...this.allEvents];
        this.renderEvents();
        this.updateEventCount();
    },

    /**
     * Update event count
     */
    updateEventCount() {
        document.getElementById('event-count').textContent = this.filteredEvents.length;
    },

    /**
     * Render events
     */
    renderEvents() {
        const tbody = document.getElementById('events-tbody');

        if (this.filteredEvents.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="no-data">No events found</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        this.filteredEvents.forEach(event => {
            const projectName = event.projectId
                ? (this.allProjects.find(p => p.id === event.projectId)?.name || 'Unknown Project')
                : 'Standalone';

            const attendees = `${event.actualAttendees || 0} / ${event.expectedAttendees || 0}`;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${event.name}</strong></td>
                <td><span class="status-badge ${FormatUtil.getStatusClass(event.status)}">${event.status}</span></td>
                <td>${FormatUtil.formatDateTime(event.eventDate)}</td>
                <td>${event.location}</td>
                <td>${attendees}</td>
                <td>${projectName}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="AdminEvents.editEvent(${event.id})" title="Edit">
                            ✏️
                        </button>
                        <button class="btn btn-sm btn-error" onclick="AdminEvents.deleteEvent(${event.id}, '${event.name}')" title="Delete">
                            🗑️
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    },

    /**
     * Open create modal
     */
    openCreateModal() {
        this.editingEvent = null;
        document.getElementById('modal-title').textContent = 'Create Event';
        document.getElementById('event-form').reset();
        document.getElementById('event-id').value = '';

        const modal = document.getElementById('event-modal');
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);
    },

    /**
     * Edit event
     */
    async editEvent(eventId) {
        try {
            Loader.show('Loading event...');

            const event = await EventService.getById(eventId);
            this.editingEvent = event;

            // Populate form
            document.getElementById('modal-title').textContent = 'Edit Event';
            document.getElementById('event-id').value = event.id;
            document.getElementById('event-name').value = event.name;
            document.getElementById('event-description').value = event.description;
            document.getElementById('event-date').value = this.toDateTimeLocal(event.eventDate);
            document.getElementById('event-end-time').value = event.eventEndTime ? this.toDateTimeLocal(event.eventEndTime) : '';
            document.getElementById('event-location').value = event.location;
            document.getElementById('expected-attendees').value = event.expectedAttendees || '';
            document.getElementById('actual-attendees').value = event.actualAttendees || '';
            document.getElementById('event-status').value = event.status;
            document.getElementById('event-project').value = event.projectId || '';
            document.getElementById('event-image').value = event.eventImageUrl || '';

            // Show modal
            const modal = document.getElementById('event-modal');
            modal.style.display = 'block';
            setTimeout(() => modal.classList.add('show'), 10);

            Loader.hide();
        } catch (error) {
            Loader.hide();
            ErrorHandler.handle(error, 'Failed to load event');
        }
    },

    /**
     * Delete event
     */
    async deleteEvent(eventId, eventName) {
        const confirmed = await new Promise(resolve => {
            Modal.confirm({
                title: 'Delete Event',
                message: `Are you sure you want to delete "${eventName}"? This action cannot be undone.`,
                confirmText: 'Delete',
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        });

        if (!confirmed) return;

        try {
            Loader.show('Deleting event...');

            await EventService.delete(eventId);

            // Log activity
            await AdminService.logActivity('DELETE', 'EVENT', eventId, `Deleted event: ${eventName}`);

            Loader.hide();
            Toast.success('Event deleted successfully');

            this.loadData();
        } catch (error) {
            Loader.hide();
            ErrorHandler.handle(error, 'Failed to delete event');
        }
    },

    /**
     * Save event
     */
    async saveEvent() {
        // Validate form
        if (!this.validateForm()) {
            Toast.error('Please fill in all required fields');
            return;
        }

        const eventId = document.getElementById('event-id').value;
        const isEditing = !!eventId;

        // Get form data
        const eventData = {
            name: document.getElementById('event-name').value.trim(),
            description: document.getElementById('event-description').value.trim(),
            eventDate: document.getElementById('event-date').value,
            eventEndTime: document.getElementById('event-end-time').value || null,
            location: document.getElementById('event-location').value.trim(),
            expectedAttendees: parseInt(document.getElementById('expected-attendees').value) || null,
            actualAttendees: parseInt(document.getElementById('actual-attendees').value) || null,
            status: document.getElementById('event-status').value,
            projectId: parseInt(document.getElementById('event-project').value) || null,
            eventImageUrl: document.getElementById('event-image').value.trim() || null
        };

        // Add organizedBy for new events
        if (!isEditing) {
            const user = AuthService.getCurrentUser();
            eventData.organizedById = user.id;
        }

        try {
            const saveButton = document.getElementById('modal-save-btn');
            Loader.showButton(saveButton, isEditing ? 'Updating...' : 'Creating...');

            let result;
            if (isEditing) {
                result = await EventService.update(eventId, eventData);
                await AdminService.logActivity('UPDATE', 'EVENT', eventId, `Updated event: ${eventData.name}`);
                Toast.success('Event updated successfully');
            } else {
                result = await EventService.create(eventData);
                await AdminService.logActivity('CREATE', 'EVENT', result.id, `Created event: ${eventData.name}`);
                Toast.success('Event created successfully');

                // Send email notification to admins
                await this.notifyAdminsOfNewEvent(result);
            }

            Loader.hideButton(saveButton);
            this.closeModal();
            this.loadData();

        } catch (error) {
            Loader.hideButton(document.getElementById('modal-save-btn'));
            ErrorHandler.handle(error, 'Failed to save event');
        }
    },

    /**
     * Validate form
     */
    validateForm() {
        const requiredFields = [
            'event-name',
            'event-description',
            'event-date',
            'event-location',
            'event-status'
        ];

        let isValid = true;
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                ValidationUtil.showFieldError(fieldId, 'This field is required');
                isValid = false;
            } else {
                ValidationUtil.clearFieldError(fieldId);
            }
        });

        return isValid;
    },

    /**
     * Notify admins of new event
     */
    async notifyAdminsOfNewEvent(event) {
        try {
            const users = await apiService.get(API_CONFIG.ENDPOINTS.USERS.BASE);
            const admins = users.filter(u => u.role === 'ADMIN' && u.email);

            for (const admin of admins) {
                await AdminService.sendEmailNotification(
                    admin.email,
                    'New Event Created',
                    `A new event "${event.name}" has been scheduled for ${FormatUtil.formatDateTime(event.eventDate)}.`,
                    'info'
                );
            }
        } catch (error) {
            console.error('Failed to send notifications:', error);
        }
    },

    /**
     * Convert ISO string to datetime-local format
     */
    toDateTimeLocal(isoString) {
        if (!isoString) return '';
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    },

    /**
     * Close modal
     */
    closeModal() {
        const modal = document.getElementById('event-modal');
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.getElementById('event-form').reset();
        }, 300);
    }
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    AdminEvents.init();
});