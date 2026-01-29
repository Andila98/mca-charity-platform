/**
 * Home Page
 * Loads and displays featured content and statistics
 */

const HomePage = {
    /**
     * Initialize page
     */
    init() {
        this.loadStatistics();
        this.loadFeaturedProjects();
        this.loadUpcomingEvents();
    },

    /**
     * Load statistics
     */
    async loadStatistics() {
        try {
            // Load donations
            const donations = await DonationService.getAll();
            const totalDonations = donations.length;
            document.getElementById('total-donations').textContent = FormatUtil.formatNumber(totalDonations);

            // Load projects
            const projects = await ProjectService.getAll();
            const activeProjects = projects.filter(p => p.status === 'ONGOING').length;
            document.getElementById('active-projects').textContent = FormatUtil.formatNumber(activeProjects);

            // Calculate total beneficiaries
            const totalBeneficiaries = projects
                .filter(p => p.actualBeneficiaries)
                .reduce((sum, p) => sum + parseInt(p.actualBeneficiaries), 0);
            document.getElementById('beneficiaries').textContent = FormatUtil.formatNumber(totalBeneficiaries);

            // Load volunteers
            const volunteers = await VolunteerService.getAll();
            const totalVolunteers = volunteers.filter(v => v.status === 'ACTIVE').length;
            document.getElementById('total-volunteers').textContent = FormatUtil.formatNumber(totalVolunteers);

        } catch (error) {
            console.error('Failed to load statistics:', error);
        }
    },

    /**
     * Load featured projects (top impact)
     */
    async loadFeaturedProjects() {
        const container = document.getElementById('featured-projects');

        // Show loading
        Loader.showSkeleton('featured-projects', 3);

        try {
            const projects = await ProjectService.getByStatus('ONGOING');

            if (!projects || projects.length === 0) {
                container.innerHTML = '<p class="no-data">No active projects at the moment.</p>';
                return;
            }

            // Sort by impact (actual beneficiaries)
            const sortedProjects = projects
                .sort((a, b) => (b.actualBeneficiaries || 0) - (a.actualBeneficiaries || 0))
                .slice(0, 3);

            container.innerHTML = '';
            sortedProjects.forEach(project => {
                const card = this.createProjectCard(project);
                container.appendChild(card);
            });

        } catch (error) {
            console.error('Failed to load featured projects:', error);
            container.innerHTML = '<p class="error-message">Failed to load projects</p>';
        }
    },

    /**
     * Create project card
     */
    createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'project-card';

        const banner = document.createElement('div');
        banner.className = 'project-banner';
        if (project.bannerImageUrl) {
            banner.style.backgroundImage = `url(${project.bannerImageUrl})`;
        } else {
            banner.style.backgroundColor = '#e0e0e0';
        }

        const body = document.createElement('div');
        body.className = 'project-card-body';

        const category = document.createElement('div');
        category.className = 'project-category';
        category.textContent = project.category || 'Community';
        body.appendChild(category);

        const title = document.createElement('h3');
        title.className = 'project-title';
        title.textContent = project.name;
        body.appendChild(title);

        const description = document.createElement('p');
        description.className = 'project-description';
        description.textContent = FormatUtil.truncateText(project.description, 100);
        body.appendChild(description);

        const meta = document.createElement('div');
        meta.className = 'project-meta';
        meta.innerHTML = `
            <div><strong>Ward:</strong> ${project.ward}</div>
            <div><strong>Beneficiaries:</strong> ${project.actualBeneficiaries || 0} / ${project.targetBeneficiaries || 0}</div>
        `;
        body.appendChild(meta);

        const actions = document.createElement('div');
        actions.className = 'project-actions';

        const viewButton = document.createElement('a');
        viewButton.href = `pages/projects.html#project-${project.id}`;
        viewButton.className = 'btn btn-primary btn-sm';
        viewButton.textContent = 'View Details';

        const donateButton = document.createElement('a');
        donateButton.href = `pages/donate.html?project=${project.id}`;
        donateButton.className = 'btn btn-secondary btn-sm';
        donateButton.textContent = 'Donate';

        actions.appendChild(viewButton);
        actions.appendChild(donateButton);
        body.appendChild(actions);

        card.appendChild(banner);
        card.appendChild(body);

        return card;
    },

    /**
     * Load upcoming events
     */
    async loadUpcomingEvents() {
        const container = document.getElementById('upcoming-events');

        // Show loading
        Loader.showSkeleton('upcoming-events', 3);

        try {
            const events = await EventService.getUpcoming();

            if (!events || events.length === 0) {
                container.innerHTML = '<p class="no-data">No upcoming events at the moment.</p>';
                return;
            }

            container.innerHTML = '';
            events.slice(0, 3).forEach(event => {
                const card = this.createEventCard(event);
                container.appendChild(card);
            });

        } catch (error) {
            console.error('Failed to load upcoming events:', error);
            container.innerHTML = '<p class="error-message">Failed to load events</p>';
        }
    },

    /**
     * Create event card
     */
    createEventCard(event) {
        const card = document.createElement('div');
        card.className = 'event-card';

        const image = document.createElement('div');
        image.className = 'event-image';
        if (event.eventImageUrl) {
            image.style.backgroundImage = `url(${event.eventImageUrl})`;
        } else {
            image.style.backgroundColor = '#e0e0e0';
        }

        const body = document.createElement('div');
        body.className = 'event-card-body';

        const dateBadge = document.createElement('div');
        dateBadge.className = 'event-date-badge';
        const date = new Date(event.eventDate);
        dateBadge.innerHTML = `
            <div class="date-day">${date.getDate()}</div>
            <div class="date-month">${date.toLocaleString('default', { month: 'short' })}</div>
        `;
        body.appendChild(dateBadge);

        const title = document.createElement('h3');
        title.className = 'event-title';
        title.textContent = event.name;
        body.appendChild(title);

        const description = document.createElement('p');
        description.className = 'event-description';
        description.textContent = FormatUtil.truncateText(event.description, 80);
        body.appendChild(description);

        const meta = document.createElement('div');
        meta.className = 'event-meta';
        meta.innerHTML = `
            <div>📅 ${FormatUtil.formatDateTime(event.eventDate)}</div>
            <div>📍 ${event.location}</div>
        `;
        body.appendChild(meta);

        const actions = document.createElement('div');
        actions.className = 'event-actions';

        const viewButton = document.createElement('a');
        viewButton.href = `pages/events.html#event-${event.id}`;
        viewButton.className = 'btn btn-primary btn-sm';
        viewButton.textContent = 'Learn More';
        actions.appendChild(viewButton);

        body.appendChild(actions);

        card.appendChild(image);
        card.appendChild(body);

        return card;
    }
};

// Initialize page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    HomePage.init();
});