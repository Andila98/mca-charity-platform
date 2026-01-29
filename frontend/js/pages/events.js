/**
 * Events Page
 * Displays and manages events with volunteer registration
 */

const EventsPage = {
    allEvents: [],
    filteredEvents: [],
    currentEvent: null,
    filters: {
        time: 'upcoming',
        status: '',
        project: ''
    },

    /**
     * Initialize page
     */
    init() {
        this.loadProjects();
        this.setupEventListeners();
        this.loadEvents();
    },

    /**
     * Load projects for filter dropdown
     */
    async loadProjects() {
        try {
            const projects = await ProjectService.getAll();
            const projectFilter = document.getElementById('project-filter');

            if (projects && projects.length > 0) {
                projects.forEach(project => {
                    const option = document.createElement('option');
                    option.value = project.id;
                    option.textContent = project.name;
                    projectFilter.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Failed to load projects:', error);
        }
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Filter changes
        document.getElementById('time-filter').addEventListener('change', (e) => {
            this.filters.time = e.target.value;
            this.applyFilters();
        });

        document.getElementById('status-filter').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.applyFilters();
        });

        document.getElementById('project-filter').addEventListener('change', (e) => {
            this.filters.project = e.target.value;
            this.applyFilters();
        });

        // Reset filters
        document.getElementById('reset-filters').addEventListener('click', () => {
            this.resetFilters();
        });

        // Modal close buttons
        document.getElementById('modal-close-btn').addEventListener('click', () => {
            this.closeRegistrationModal();
        });

        document.getElementById('modal-cancel-btn').addEventListener('click', () => {
            this.closeRegistrationModal();
        });

        document.getElementById('modal-register-btn').addEventListener('click', () => {
            this.handleRegistration();
        });
    },

    /**
     * Load all events
     */
    async loadEvents() {
        const container = document.getElementById('events-grid');

        // Show loading
        Loader.showSkeleton('events-grid', 4);

        try {
            const events = await EventService.getAll();
            this.allEvents = events || [];
            this.applyFilters();

        } catch (error) {
            console.error('Failed to load events:', error);
            container.innerHTML = '<div class="error-message">Failed to load events. Please try again later.</div>';
            ErrorHandler.handle(error, 'Failed to load events');
        }
    },

    /**
     * Apply filters
     */
    applyFilters() {
        const now = new Date();

        this.filteredEvents = this.allEvents.filter(event => {
            const eventDate = new Date(event.eventDate);

            // Time filter
            if (this.filters.time === 'upcoming' && eventDate <= now) {
                return false;
            } else if (this.filters.time === 'past' && eventDate > now) {
                return false;
            }

            // Status filter
            if (this.filters.status && event.status !== this.filters.status) {
                return false;
            }

            // Project filter
            if (this.filters.project) {
                const projectId = parseInt(this.filters.project);
                if (!event.projectId || event.projectId !== projectId) {
                    return false;
                }
            }

            return true;
        });

        // Sort by date (upcoming first)
        this.filteredEvents.sort((a, b) => {
            return new Date(a.eventDate) - new Date(b.eventDate);
        });

        this.renderEvents();
        this.updateEventCount();
    },

    /**
     * Reset filters
     */
    resetFilters() {
        this.filters = {
            time: 'upcoming',
            status: '',
            project: ''
        };

        document.getElementById('time-filter').value = 'upcoming';
        document.getElementById('status-filter').value = '';
        document.getElementById('project-filter').value = '';

        this.applyFilters();
    },

    /**
     * Update event count display
     */
    updateEventCount() {
        document.getElementById('event-count').textContent = this.filteredEvents.length;
    },

    /**
     * Render events
     */
    renderEvents() {
        const container = document.getElementById('events-grid');
        const emptyState = document.getElementById('empty-state');

        if (this.filteredEvents.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        container.innerHTML = '';

        this.filteredEvents.forEach(event => {
            const card = this.createEventCard(event);
            container.appendChild(card);
        });
    },

    /**
     * Create event card element
     */
    createEventCard(event) {
        const card = document.createElement('div');
        card.className = 'event-card';

        const now = new Date();
        const eventDate = new Date(event.eventDate);
        const isPast = eventDate < now;

        // Event image
        const image = document.createElement('div');
        image.className = 'event-image';
        if (event.eventImageUrl) {
            image.style.backgroundImage = `url(${event.eventImageUrl})`;
        } else {
            image.style.backgroundColor = '#e0e0e0';
            image.innerHTML = '<div class="placeholder-icon">📅</div>';
        }

        // Status badge
        const statusBadge = document.createElement('span');
        statusBadge.className = `status-badge ${FormatUtil.getStatusClass(event.status)}`;
        statusBadge.textContent = FormatUtil.capitalizeFirst(event.status);
        image.appendChild(statusBadge);

        // Card body
        const body = document.createElement('div');
        body.className = 'event-card-body';

        // Date badge
        const dateBadge = document.createElement('div');
        dateBadge.className = 'event-date-badge';
        const date = new Date(event.eventDate);
        dateBadge.innerHTML = `
            <div class="date-day">${date.getDate()}</div>
            <div class="date-month">${date.toLocaleString('default', { month: 'short' })}</div>
        `;
        body.appendChild(dateBadge);

        // Title
        const title = document.createElement('h3');
        title.className = 'event-title';
        title.textContent = event.name;
        body.appendChild(title);

        // Description
        const description = document.createElement('p');
        description.className = 'event-description';
        description.textContent = FormatUtil.truncateText(event.description, 100);
        body.appendChild(description);

        // Meta info
        const meta = document.createElement('div');
        meta.className = 'event-meta';

        const dateTime = document.createElement('div');
        dateTime.className = 'meta-item';
        dateTime.innerHTML = `<strong>📅</strong> ${FormatUtil.formatDateTime(event.eventDate)}`;
        meta.appendChild(dateTime);

        const location = document.createElement('div');
        location.className = 'meta-item';
        location.innerHTML = `<strong>📍</strong> ${event.location}`;
        meta.appendChild(location);

        const attendees = document.createElement('div');
        attendees.className = 'meta-item';
        const registered = event.registeredVolunteerIds ? event.registeredVolunteerIds.length : 0;
        attendees.innerHTML = `<strong>👥</strong> ${registered} / ${event.expectedAttendees || 0} registered`;
        meta.appendChild(attendees);

        body.appendChild(meta);

        // Actions
        const actions = document.createElement('div');
        actions.className = 'event-actions';

        if (!isPast && event.status !== 'CANCELLED' && event.status !== 'COMPLETED') {
            const registerButton = document.createElement('button');
            registerButton.className = 'btn btn-primary btn-sm';
            registerButton.textContent = 'Register as Volunteer';
            registerButton.addEventListener('click', () => this.showRegistrationModal(event));
            actions.appendChild(registerButton);
        }

        const detailsButton = document.createElement('button');
        detailsButton.className = 'btn btn-secondary btn-sm';
        detailsButton.textContent = 'View Details';
        detailsButton.addEventListener('click', () => this.showEventDetails(event));
        actions.appendChild(detailsButton);

        body.appendChild(actions);

        card.appendChild(image);
        card.appendChild(body);

        return card;
    },

    /**
     * Show event details
     */
    showEventDetails(event) {
        const content = `
            <div class="event-detail-content">
                ${event.eventImageUrl ? `<img src="${event.eventImageUrl}" alt="${event.name}" class="detail-image">` : ''}

                <div class="detail-section">
                    <h4>Description</h4>
                    <p>${event.description}</p>
                </div>

                <div class="detail-grid">
                    <div class="detail-item">
                        <strong>Status:</strong>
                        <span class="status-badge ${FormatUtil.getStatusClass(event.status)}">${FormatUtil.capitalizeFirst(event.status)}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Date & Time:</strong> ${FormatUtil.formatDateTime(event.eventDate)}
                    </div>
                    <div class="detail-item">
                        <strong>Location:</strong> ${event.location}
                    </div>
                    <div class="detail-item">
                        <strong>Expected Attendees:</strong> ${FormatUtil.formatNumber(event.expectedAttendees || 0)}
                    </div>
                    <div class="detail-item">
                        <strong>Registered Volunteers:</strong> ${event.registeredVolunteerIds ? event.registeredVolunteerIds.length : 0}
                    </div>
                    ${event.actualAttendees ? `
                    <div class="detail-item">
                        <strong>Actual Attendees:</strong> ${FormatUtil.formatNumber(event.actualAttendees)}
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        Modal.show({
            title: event.name,
            content: content,
            size: 'large',
            buttons: [
                {
                    id: 'close-detail-btn',
                    text: 'Close',
                    class: 'btn-secondary',
                    onClick: () => Modal.hide()
                }
            ]
        });
    },

    /**
     * Show registration modal
     */
    showRegistrationModal(event) {
        this.currentEvent = event;
        document.getElementById('event-id').value = event.id;

        const modal = document.getElementById('registration-modal');
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);
    },

    /**
     * Close registration modal
     */
    closeRegistrationModal() {
        const modal = document.getElementById('registration-modal');
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.getElementById('registration-form').reset();
            this.currentEvent = null;
        }, 300);
    },

    /**
     * Handle volunteer registration
     */
    async handleRegistration() {
        const form = document.getElementById('registration-form');
        const name = document.getElementById('volunteer-name').value.trim();
        const email = document.getElementById('volunteer-email').value.trim();
        const phone = document.getElementById('volunteer-phone').value.trim();

        // Validate
        ValidationUtil.clearFormErrors('registration-form');
        let isValid = true;

        if (!name) {
            ValidationUtil.showFieldError('volunteer-name', 'Name is required');
            isValid = false;
        }

        if (!ValidationUtil.isValidEmail(email)) {
            ValidationUtil.showFieldError('volunteer-email', 'Valid email is required');
            isValid = false;
        }

        if (!ValidationUtil.isValidPhone(phone)) {
            ValidationUtil.showFieldError('volunteer-phone', 'Valid phone number is required');
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        const registerButton = document.getElementById('modal-register-btn');
        Loader.showButton(registerButton, 'Registering...');

        try {
            // First, check if volunteer exists or create new
            let volunteer = await this.findOrCreateVolunteer(name, email, phone);

            // Register volunteer for event
            await EventService.registerVolunteer(this.currentEvent.id, volunteer.id);

            Loader.hideButton(registerButton);
            Toast.success('Successfully registered for the event!');
            this.closeRegistrationModal();

            // Reload events to update registration count
            this.loadEvents();

        } catch (error) {
            Loader.hideButton(registerButton);
            ErrorHandler.handle(error, 'Failed to register for event');
        }
    },

    /**
     * Find or create volunteer
     */
    async findOrCreateVolunteer(name, email, phone) {
        try {
            // Try to find existing volunteer by email
            const volunteers = await VolunteerService.getAll();
            const existing = volunteers.find(v => v.email === email);

            if (existing) {
                return existing;
            }

            // Create new volunteer
            const newVolunteer = await VolunteerService.register({
                name,
                email,
                phone,
                ward: '',
                interests: ['Event Participation'],
                bio: 'Registered through event registration'
            });

            return newVolunteer;

        } catch (error) {
            throw error;
        }
    }
};

// Initialize page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    EventsPage.init();
});