/**
 * Admin Projects Management Page
 * Full CRUD operations for projects
 */

const AdminProjects = {
    allProjects: [],
    filteredProjects: [],
    editingProject: null,

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

        this.populateDropdowns();
        this.setupEventListeners();
        this.loadProjects();
        this.checkForCreateAction();
    },

    /**
     * Populate dropdowns
     */
    populateDropdowns() {
        const wardSelects = ['ward-filter', 'project-ward'];

        wardSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                this.WARDS.forEach(ward => {
                    const option = document.createElement('option');
                    option.value = ward;
                    option.textContent = ward;
                    select.appendChild(option);
                });
            }
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

        // Create project button
        document.getElementById('create-project-btn').addEventListener('click', () => {
            this.openCreateModal();
        });

        // Filters
        document.getElementById('status-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('ward-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('search-input').addEventListener('input', () => this.applyFilters());
        document.getElementById('reset-filters').addEventListener('click', () => this.resetFilters());

        // Modal buttons
        document.getElementById('modal-close-btn').addEventListener('click', () => this.closeModal());
        document.getElementById('modal-cancel-btn').addEventListener('click', () => this.closeModal());
        document.getElementById('modal-save-btn').addEventListener('click', () => this.saveProject());
    },

    /**
     * Check if should open create modal
     */
    checkForCreateAction() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('action') === 'create') {
            this.openCreateModal();
        }
    },

    /**
     * Load projects
     */
    async loadProjects() {
        try {
            Loader.show('Loading projects...');

            this.allProjects = await ProjectService.getAll();
            this.filteredProjects = [...this.allProjects];

            this.renderProjects();
            this.updateProjectCount();

            Loader.hide();
        } catch (error) {
            Loader.hide();
            ErrorHandler.handle(error, 'Failed to load projects');
        }
    },

    /**
     * Apply filters
     */
    applyFilters() {
        const status = document.getElementById('status-filter').value;
        const ward = document.getElementById('ward-filter').value;
        const search = document.getElementById('search-input').value.toLowerCase();

        this.filteredProjects = this.allProjects.filter(project => {
            if (status && project.status !== status) return false;
            if (ward && project.ward !== ward) return false;
            if (search && !project.name.toLowerCase().includes(search) &&
                !project.description.toLowerCase().includes(search)) return false;
            return true;
        });

        this.renderProjects();
        this.updateProjectCount();
    },

    /**
     * Reset filters
     */
    resetFilters() {
        document.getElementById('status-filter').value = '';
        document.getElementById('ward-filter').value = '';
        document.getElementById('search-input').value = '';

        this.filteredProjects = [...this.allProjects];
        this.renderProjects();
        this.updateProjectCount();
    },

    /**
     * Update project count
     */
    updateProjectCount() {
        document.getElementById('project-count').textContent = this.filteredProjects.length;
    },

    /**
     * Render projects
     */
    renderProjects() {
        const tbody = document.getElementById('projects-tbody');

        if (this.filteredProjects.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="no-data">No projects found</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        this.filteredProjects.forEach(project => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${project.name}</strong></td>
                <td><span class="status-badge ${FormatUtil.getStatusClass(project.status)}">${project.status}</span></td>
                <td>${project.ward}</td>
                <td>${project.category || 'N/A'}</td>
                <td>${project.actualBeneficiaries || 0} / ${project.targetBeneficiaries || 0}</td>
                <td>${FormatUtil.formatDate(project.startDate)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="AdminProjects.editProject(${project.id})" title="Edit">
                            ✏️
                        </button>
                        <button class="btn btn-sm btn-error" onclick="AdminProjects.deleteProject(${project.id}, '${project.name}')" title="Delete">
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
        this.editingProject = null;
        document.getElementById('modal-title').textContent = 'Create Project';
        document.getElementById('project-form').reset();
        document.getElementById('project-id').value = '';

        const modal = document.getElementById('project-modal');
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);
    },

    /**
     * Edit project
     */
    async editProject(projectId) {
        try {
            Loader.show('Loading project...');

            const project = await ProjectService.getById(projectId);
            this.editingProject = project;

            // Populate form
            document.getElementById('modal-title').textContent = 'Edit Project';
            document.getElementById('project-id').value = project.id;
            document.getElementById('project-name').value = project.name;
            document.getElementById('project-description').value = project.description;
            document.getElementById('project-ward').value = project.ward;
            document.getElementById('project-category').value = project.category || '';
            document.getElementById('project-status').value = project.status;
            document.getElementById('target-beneficiaries').value = project.targetBeneficiaries || '';
            document.getElementById('actual-beneficiaries').value = project.actualBeneficiaries || '';
            document.getElementById('banner-url').value = project.bannerImageUrl || '';
            document.getElementById('start-date').value = FormatUtil.toInputDate(project.startDate);
            document.getElementById('end-date').value = project.endDate ? FormatUtil.toInputDate(project.endDate) : '';
            document.getElementById('impact-summary').value = project.impactSummary || '';

            // Show modal
            const modal = document.getElementById('project-modal');
            modal.style.display = 'block';
            setTimeout(() => modal.classList.add('show'), 10);

            Loader.hide();
        } catch (error) {
            Loader.hide();
            ErrorHandler.handle(error, 'Failed to load project');
        }
    },

    /**
     * Delete project
     */
    async deleteProject(projectId, projectName) {
        const confirmed = await new Promise(resolve => {
            Modal.confirm({
                title: 'Delete Project',
                message: `Are you sure you want to delete "${projectName}"? This action cannot be undone.`,
                confirmText: 'Delete',
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        });

        if (!confirmed) return;

        try {
            Loader.show('Deleting project...');

            await ProjectService.delete(projectId);

            // Log activity
            await AdminService.logActivity('DELETE', 'PROJECT', projectId, `Deleted project: ${projectName}`);

            Loader.hide();
            Toast.success('Project deleted successfully');

            this.loadProjects();
        } catch (error) {
            Loader.hide();
            ErrorHandler.handle(error, 'Failed to delete project');
        }
    },

    /**
     * Save project
     */
    async saveProject() {
        // Validate form
        if (!this.validateForm()) {
            Toast.error('Please fill in all required fields');
            return;
        }

        const projectId = document.getElementById('project-id').value;
        const isEditing = !!projectId;

        // Get form data
        const projectData = {
            name: document.getElementById('project-name').value.trim(),
            description: document.getElementById('project-description').value.trim(),
            ward: document.getElementById('project-ward').value,
            category: document.getElementById('project-category').value || null,
            status: document.getElementById('project-status').value,
            targetBeneficiaries: parseInt(document.getElementById('target-beneficiaries').value) || null,
            actualBeneficiaries: parseInt(document.getElementById('actual-beneficiaries').value) || null,
            bannerImageUrl: document.getElementById('banner-url').value.trim() || null,
            startDate: document.getElementById('start-date').value,
            endDate: document.getElementById('end-date').value || null,
            impactSummary: document.getElementById('impact-summary').value.trim() || null
        };

        // Add createdBy for new projects
        if (!isEditing) {
            const user = AuthService.getCurrentUser();
            projectData.createdById = user.id;
        }

        try {
            const saveButton = document.getElementById('modal-save-btn');
            Loader.showButton(saveButton, isEditing ? 'Updating...' : 'Creating...');

            let result;
            if (isEditing) {
                result = await ProjectService.update(projectId, projectData);
                await AdminService.logActivity('UPDATE', 'PROJECT', projectId, `Updated project: ${projectData.name}`);
                Toast.success('Project updated successfully');
            } else {
                result = await ProjectService.create(projectData);
                await AdminService.logActivity('CREATE', 'PROJECT', result.id, `Created project: ${projectData.name}`);
                Toast.success('Project created successfully');

                // Send email notification to all admins
                await this.notifyAdminsOfNewProject(result);
            }

            Loader.hideButton(saveButton);
            this.closeModal();
            this.loadProjects();

        } catch (error) {
            Loader.hideButton(document.getElementById('modal-save-btn'));
            ErrorHandler.handle(error, 'Failed to save project');
        }
    },

    /**
     * Validate form
     */
    validateForm() {
        const requiredFields = [
            'project-name',
            'project-description',
            'project-ward',
            'project-status',
            'start-date'
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
     * Notify admins of new project
     */
    async notifyAdminsOfNewProject(project) {
        try {
            const users = await apiService.get(API_CONFIG.ENDPOINTS.USERS.BASE);
            const admins = users.filter(u => u.role === 'ADMIN' && u.email);

            for (const admin of admins) {
                await AdminService.sendEmailNotification(
                    admin.email,
                    'New Project Created',
                    `A new project "${project.name}" has been created in ${project.ward}.`,
                    'info'
                );
            }
        } catch (error) {
            console.error('Failed to send notifications:', error);
        }
    },

    /**
     * Close modal
     */
    closeModal() {
        const modal = document.getElementById('project-modal');
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.getElementById('project-form').reset();
        }, 300);
    }
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    AdminProjects.init();
});