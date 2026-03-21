<!DOCTYPE html>
<!--
  CONSOLIDATED JAVASCRIPT BUNDLE
  ==============================
  This file contains all JavaScript code for the Charity Platform.
  It merges 30+ modules into a single, well-organized file with proper
  load order, dependency resolution, and no global conflicts.
  
  To use: include this file AFTER the DOM is ready, or simply include it
  as a script tag at the end of <body>.
  
  Version: 1.0.0
  Generated: 2025-01-08
-->
<script>
// ============================================================
// 1. UTILITIES & CORE HELPERS
// ============================================================

/**
 * Format Utility - formatting helpers
 */
const FormatUtil = {
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    },
    formatDateTime(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const datePart = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        const timePart = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        return `${datePart} at ${timePart}`;
    },
    formatCurrency(amount) {
        if (amount === null || amount === undefined) return 'KES 0.00';
        const num = parseFloat(amount);
        if (isNaN(num)) return 'KES 0.00';
        return `KES ${num.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },
    formatPhone(phone) {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        let formatted = cleaned;
        if (cleaned.startsWith('0')) formatted = '254' + cleaned.substring(1);
        else if (cleaned.startsWith('254')) {}
        else if (cleaned.startsWith('+254')) formatted = cleaned.substring(1);
        else formatted = '254' + cleaned;
        return `+${formatted.substring(0, 3)} ${formatted.substring(3, 6)} ${formatted.substring(6, 9)} ${formatted.substring(9)}`;
    },
    formatNumber(number) {
        if (number === null || number === undefined) return '0';
        const num = parseFloat(number);
        if (isNaN(num)) return '0';
        return num.toLocaleString('en-US');
    },
    truncateText(text, maxLength = 50) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },
    capitalizeFirst(text) {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },
    toTitleCase(text) {
        if (!text) return '';
        return text.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    },
    getStatusClass(status) {
        const map = {
            'ACTIVE': 'status-active', 'INACTIVE': 'status-inactive', 'SUSPENDED': 'status-suspended',
            'PLANNED': 'status-planned', 'ONGOING': 'status-ongoing', 'COMPLETED': 'status-completed',
            'CANCELLED': 'status-cancelled', 'PENDING': 'status-pending', 'RECEIVED': 'status-received',
            'USED': 'status-used'
        };
        return map[status] || 'status-default';
    },
    formatRelativeTime(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffSecs = Math.floor((now - date) / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        if (diffSecs < 60) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return this.formatDate(dateString);
    },
    toInputDate(dateString) {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
    },
    toInputDateTime(dateString) {
        if (!dateString) return '';
        return new Date(dateString).toISOString().slice(0, 16);
    }
};

/**
 * Validation Utility
 */
const ValidationUtil = {
    email(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); },
    phone(value) { return value.replace(/\D/g, '').length >= 9; },
    required(value) { return value && value.trim().length > 0; },
    minLength(value, min) { return value && value.length >= min; },
    number(value) { return !isNaN(parseFloat(value)) && isFinite(value); },
    positiveNumber(value) { return this.number(value) && parseFloat(value) > 0; },
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            let errorEl = field.nextElementSibling;
            if (errorEl && errorEl.classList && errorEl.classList.contains('error-message')) {
                errorEl.textContent = message;
                errorEl.style.display = 'block';
            } else {
                errorEl = document.createElement('span');
                errorEl.className = 'error-message';
                errorEl.textContent = message;
                field.parentNode.insertBefore(errorEl, field.nextSibling);
            }
        }
    },
    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        if (field && field.nextElementSibling && field.nextElementSibling.classList && field.nextElementSibling.classList.contains('error-message')) {
            field.nextElementSibling.textContent = '';
            field.nextElementSibling.style.display = 'none';
        }
    },
    clearFormErrors(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.querySelectorAll('.error-message').forEach(el => { el.textContent = ''; el.style.display = 'none'; });
        }
    },
    validateField(value, rules) {
        const errors = [];
        if (rules.required && !this.required(value)) errors.push('This field is required');
        if (rules.email && !this.email(value)) errors.push('Invalid email format');
        if (rules.phone && !this.phone(value)) errors.push('Invalid phone number');
        if (rules.minLength && !this.minLength(value, rules.minLength)) errors.push(`Minimum ${rules.minLength} characters required`);
        if (rules.min && parseFloat(value) < rules.min) errors.push(`Value must be at least ${rules.min}`);
        return errors;
    }
};

/**
 * Storage Utility
 */
const StorageUtil = {
    set(key, value) {
        try { localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value)); }
        catch (e) { console.error('Storage set error:', e); }
    },
    get(key) {
        try {
            const data = localStorage.getItem(key);
            if (!data) return null;
            try { return JSON.parse(data); } catch { return data; }
        } catch (e) { console.error('Storage get error:', e); return null; }
    },
    remove(key) { try { localStorage.removeItem(key); } catch (e) { console.error('Storage remove error:', e); } },
    clear() { try { localStorage.clear(); } catch (e) { console.error('Storage clear error:', e); } },
    has(key) { return localStorage.getItem(key) !== null; }
};

// ============================================================
// 2. API CLIENT (Unified)
// ============================================================

class APIClient {
    constructor(baseURL = 'http://localhost:8080/api') {
        this.baseURL = baseURL;
        this.version = 'v1';
        this.authToken = this.loadToken();
        this.timeout = 10000;
        this.interceptors = { request: [], response: [], error: [] };
    }
    loadToken() { try { return localStorage.getItem('auth_token') || null; } catch(e) { return null; } }
    setToken(token) { this.authToken = token; try { localStorage.setItem('auth_token', token); } catch(e) {} }
    clearToken() { this.authToken = null; try { localStorage.removeItem('auth_token'); } catch(e) {} }
    getHeaders(custom = {}) {
        const headers = { 'Content-Type': 'application/json', ...custom };
        if (this.authToken) headers['Authorization'] = `Bearer ${this.authToken}`;
        return headers;
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}/${this.version}${endpoint}`;
        let config = { ...options, headers: this.getHeaders(options.headers) };
        for (const fn of this.interceptors.request) config = await fn(config);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        config.signal = controller.signal;
        try {
            const response = await fetch(url, config);
            clearTimeout(timeoutId);
            if (!response.ok) throw await this.parseError(response);
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) data = await response.json();
            else data = await response.text();
            for (const fn of this.interceptors.response) data = await fn(data);
            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') { const e = new Error('Request timeout'); e.status = 408; throw e; }
            if (error.status === 401) { this.clearToken(); window.location.href = '/pages/login.html'; }
            for (const fn of this.interceptors.error) error = await fn(error);
            throw error;
        }
    }
    async parseError(response) {
        let message = `HTTP ${response.status}: ${response.statusText}`;
        try {
            const ct = response.headers.get('content-type');
            if (ct && ct.includes('application/json')) {
                const errData = await response.json();
                message = errData.message || message;
            } else message = await response.text();
        } catch(e) {}
        const err = new Error(message);
        err.status = response.status;
        return err;
    }
    get(endpoint, params = {}) {
        const query = new URLSearchParams(params).toString();
        const url = query ? `${endpoint}?${query}` : endpoint;
        return this.request(url, { method: 'GET' });
    }
    post(endpoint, data) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(data) }); }
    put(endpoint, data) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(data) }); }
    patch(endpoint, data) { return this.request(endpoint, { method: 'PATCH', body: JSON.stringify(data) }); }
    delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); }
    async uploadFile(endpoint, formData) {
        const url = `${this.baseURL}/${this.version}${endpoint}`;
        const headers = this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {};
        const response = await fetch(url, { method: 'POST', headers, body: formData });
        if (!response.ok) throw new Error('File upload failed');
        return await response.json();
    }
    isAuthenticated() { return !!this.authToken; }
    getToken() { return this.authToken; }
}

const apiClient = new APIClient();
const adminAPI = apiClient; // backward compatibility

// ============================================================
// 3. AUTH SERVICE (Unified)
// ============================================================

class AuthService {
    constructor(api) {
        this.api = api;
        this.currentUser = null;
        this.isAdmin = false;
        this.loadUserFromStorage();
    }
    loadUserFromStorage() {
        try {
            const userData = localStorage.getItem('user_data');
            if (userData) {
                this.currentUser = JSON.parse(userData);
                this.isAdmin = this.currentUser.role === 'ADMIN' || this.currentUser.role === 'EDITOR';
            }
        } catch(e) { this.logout(); }
    }
    async register(userData) {
        const response = await this.api.post('/auth/register', userData);
        return response;
    }
    async login(credentials) {
        const response = await this.api.post('/auth/login', credentials);
        this.api.setToken(response.token || response.auth_token);
        const user = response.user || response;
        this.currentUser = {
            id: user.id, email: user.email, fullName: user.fullName || user.full_name,
            role: user.role, ward: user.ward, isApproved: user.isApproved !== false
        };
        this.isAdmin = this.currentUser.role === 'ADMIN' || this.currentUser.role === 'EDITOR';
        localStorage.setItem('user_data', JSON.stringify(this.currentUser));
        return response;
    }
    async adminLogin(credentials) {
        const response = await this.api.post('/admin/auth/login', credentials);
        this.api.setToken(response.token || response.auth_token);
        const user = response.user || response;
        this.currentUser = {
            id: user.id, email: user.email, fullName: user.fullName || user.full_name,
            role: user.role || 'ADMIN', ward: user.ward, isApproved: true
        };
        this.isAdmin = true;
        localStorage.setItem('user_data', JSON.stringify(this.currentUser));
        return response;
    }
    logout() {
        this.api.clearToken();
        this.currentUser = null;
        this.isAdmin = false;
        localStorage.removeItem('user_data');
    }
    isAuthenticated() { return !!this.api.authToken && !!this.currentUser; }
    getCurrentUser() { return this.currentUser; }
    hasAdminRole() { return this.isAdmin && this.isAuthenticated(); }
    getUserRole() { return this.currentUser?.role || null; }
    hasRole(role) { return this.currentUser?.role === role; }
    getToken() { return this.api.getToken(); }
    async validateToken() {
        if (!this.api.authToken) return false;
        try { await this.api.get('/auth/validate'); return true; }
        catch(e) { this.logout(); return false; }
    }
    async updateProfile(profileData) {
        if (!this.currentUser) throw new Error('Not authenticated');
        const response = await this.api.put(`/users/${this.currentUser.id}`, profileData);
        this.currentUser = { ...this.currentUser, ...profileData };
        localStorage.setItem('user_data', JSON.stringify(this.currentUser));
        return response;
    }
    requireAuth() {
        if (!this.isAuthenticated()) {
            localStorage.setItem('redirect_after_login', window.location.pathname);
            window.location.href = '/pages/login.html';
        }
    }
    requireAdmin() {
        this.requireAuth();
        if (!this.hasAdminRole()) { alert('No permission'); window.location.href = '/index.html'; }
    }
    requireRole(role) {
        this.requireAuth();
        if (!this.hasRole(role)) { alert(`Must be ${role}`); window.location.href = '/index.html'; }
    }
    handleLoginRedirect() {
        const redirect = localStorage.getItem('redirect_after_login');
        if (redirect) { localStorage.removeItem('redirect_after_login'); window.location.href = redirect; }
        else window.location.href = '/index.html';
    }
}

const authService = new AuthService(apiClient);
window.authService = authService;

// ============================================================
// 4. SERVICE LAYERS (Projects, Donations, Events, Volunteers)
// ============================================================

class ProjectService {
    static async create(data) { return await apiClient.post('/projects', data); }
    static async getAll() { return await apiClient.get('/projects'); }
    static async getById(id) { return await apiClient.get(`/projects/${id}`); }
    static async getByStatus(status) { return await apiClient.get(`/projects/status/${status}`); }
    static async getByWard(ward) { return await apiClient.get(`/projects/ward/${ward}`); }
    static async getTopImpact() { return await apiClient.get('/projects/top-impact'); }
    static async update(id, data) { return await apiClient.put(`/projects/${id}`, data); }
    static async delete(id) { return await apiClient.delete(`/projects/${id}`); }
}

class DonationService {
    static async create(data) { return await apiClient.post('/donations', data); }
    static async getAll() { return await apiClient.get('/donations'); }
    static async getById(id) { return await apiClient.get(`/donations/${id}`); }
    static async getByStatus(status) { return await apiClient.get(`/donations/status/${status}`); }
    static async getByProject(projectId) { return await apiClient.get(`/donations/project/${projectId}`); }
    static async getTotalForProject(projectId) { return await apiClient.get(`/donations/project/${projectId}/total`); }
    static async update(id, data) { return await apiClient.put(`/donations/${id}`, data); }
    static async delete(id) { return await apiClient.delete(`/donations/${id}`); }
}

class EventService {
    static async create(data) { return await apiClient.post('/events', data); }
    static async getAll() { return await apiClient.get('/events'); }
    static async getById(id) { return await apiClient.get(`/events/${id}`); }
    static async getUpcoming() { return await apiClient.get('/events/upcoming'); }
    static async getByProject(projectId) { return await apiClient.get(`/events/project/${projectId}`); }
    static async registerVolunteer(eventId, volunteerId) { return await apiClient.post(`/events/${eventId}/register/${volunteerId}`); }
    static async update(id, data) { return await apiClient.put(`/events/${id}`, data); }
    static async delete(id) { return await apiClient.delete(`/events/${id}`); }
}

class VolunteerService {
    static async register(data) { return await apiClient.post('/volunteers', data); }
    static async getAll() { return await apiClient.get('/volunteers'); }
    static async getById(id) { return await apiClient.get(`/volunteers/${id}`); }
    static async getByStatus(status) { return await apiClient.get(`/volunteers/status/${status}`); }
    static async getByWard(ward) { return await apiClient.get(`/volunteers/ward/${ward}`); }
    static async getByInterest(interest) { return await apiClient.get(`/volunteers/interest/${interest}`); }
    static async update(id, data) { return await apiClient.put(`/volunteers/${id}`, data); }
    static async delete(id) { return await apiClient.delete(`/volunteers/${id}`); }
    static async getActiveCount() { const v = await this.getByStatus('ACTIVE'); return v.length; }
    static async getRecent() { const all = await this.getAll(); return all.sort((a,b)=>new Date(b.registeredAt)-new Date(a.registeredAt)).slice(0,6); }
}

class AdminService {
    static async getDashboardStats() { /* simplified */ return {}; }
    static async getRecentActivity(limit=10) { return []; }
    static async approveUser(userId) { return await apiClient.put(`/users/${userId}/approve`); }
    static async updateUserRole(userId, role) {
        const user = await apiClient.get(`/users/${userId}`);
        user.role = role;
        return await apiClient.put(`/users/${userId}`, user);
    }
    static async deleteUser(userId) { return await apiClient.delete(`/users/${userId}`); }
    static async getPendingApprovals() { return await apiClient.get('/users/unapproved'); }
    static async backupData() { /* stub */ }
    static async logActivity(action, entityType, entityId, details) {
        const user = authService.getCurrentUser();
        const log = {
            userId: user?.id, userName: user?.fullName, action, entityType, entityId, details,
            timestamp: new Date().toISOString(), ipAddress: 'unknown'
        };
        const logs = StorageUtil.get('activity_logs') || [];
        logs.unshift(log);
        if (logs.length > 1000) logs.splice(1000);
        StorageUtil.set('activity_logs', logs);
        return log;
    }
    static getActivityLogs(limit=50) { return (StorageUtil.get('activity_logs') || []).slice(0,limit); }
    static async sendEmailNotification(to, subject, message, type='info') {
        const notif = { to, subject, message, type, sentAt: new Date().toISOString(), status: 'sent' };
        const notifs = StorageUtil.get('email_notifications') || [];
        notifs.unshift(notif);
        if (notifs.length > 100) notifs.splice(100);
        StorageUtil.set('email_notifications', notifs);
        return notif;
    }
    static getEmailNotifications(limit=50) { return (StorageUtil.get('email_notifications') || []).slice(0,limit); }
    static exportToCSV(data, filename) {
        if (!data?.length) throw new Error('No data');
        const headers = Object.keys(data[0]);
        let csv = headers.join(',') + '\n';
        data.forEach(row => {
            const vals = headers.map(h => {
                let v = row[h];
                if (typeof v === 'string' && (v.includes(',') || v.includes('"'))) v = `"${v.replace(/"/g, '""')}"`;
                return v;
            });
            csv += vals.join(',') + '\n';
        });
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

// ============================================================
// 5. UI COMPONENTS (Toast, Modal, Loader)
// ============================================================

const Toast = {
    success(msg, dur=3000) { this.show(msg, 'success', dur); },
    error(msg, dur=4000) { this.show(msg, 'error', dur); },
    info(msg, dur=3000) { this.show(msg, 'info', dur); },
    warning(msg, dur=3000) { this.show(msg, 'warning', dur); },
    show(message, type, duration) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};

const Modal = {
    show(options={}) {
        const { title='Modal', content='', buttons=[], size='medium', closeButton=true, backdrop=true, onClose=null } = options;
        this.hide();
        const modal = document.createElement('div');
        modal.id = 'app-modal';
        modal.className = 'modal';
        let btnsHtml = buttons.length ? '<div class="modal-footer">' + buttons.map(b => `<button class="btn ${b.class||'btn-secondary'}" id="${b.id||''}">${b.text||'Button'}</button>`).join('') + '</div>' : '';
        modal.innerHTML = `
            <div class="modal-backdrop ${backdrop ? '' : 'hidden'}"></div>
            <div class="modal-dialog modal-${size}">
                <div class="modal-content">
                    <div class="modal-header"><h3>${title}</h3>${closeButton ? '<button class="modal-close">×</button>' : ''}</div>
                    <div class="modal-body">${content}</div>
                    ${btnsHtml}
                </div>
            </div>`;
        document.body.appendChild(modal);
        if (closeButton) modal.querySelector('.modal-close').addEventListener('click', () => { this.hide(); if(onClose) onClose(); });
        if (backdrop) modal.querySelector('.modal-backdrop').addEventListener('click', () => { this.hide(); if(onClose) onClose(); });
        buttons.forEach(b => { if(b.id && b.onClick) document.getElementById(b.id)?.addEventListener('click', b.onClick); });
        setTimeout(() => modal.classList.add('show'), 10);
        document.body.style.overflow = 'hidden';
        return modal;
    },
    hide() {
        const m = document.getElementById('app-modal');
        if(m) { m.classList.remove('show'); setTimeout(() => { m.remove(); document.body.style.overflow = ''; }, 300); }
    },
    confirm(options) {
        const { title='Confirm', message='Are you sure?', confirmText='Yes', cancelText='No', onConfirm, onCancel } = options;
        return this.show({
            title, content: `<p>${message}</p>`,
            buttons: [
                { id:'modal-cancel-btn', text:cancelText, class:'btn-secondary', onClick:()=>{ this.hide(); if(onCancel) onCancel(); } },
                { id:'modal-confirm-btn', text:confirmText, class:'btn-primary', onClick:()=>{ this.hide(); if(onConfirm) onConfirm(); } }
            ]
        });
    },
    alert(options) {
        const { title='Alert', message='', buttonText='OK', onClose } = options;
        return this.show({
            title, content: `<p>${message}</p>`,
            buttons: [{ id:'modal-ok-btn', text:buttonText, class:'btn-primary', onClick:()=>{ this.hide(); if(onClose) onClose(); } }]
        });
    }
};

const Loader = {
    show(msg='Loading...') {
        this.hide();
        const loader = document.createElement('div');
        loader.id = 'page-loader';
        loader.className = 'page-loader';
        loader.innerHTML = `<div class="loader-content"><div class="spinner"></div><p>${msg}</p></div>`;
        document.body.appendChild(loader);
        document.body.style.overflow = 'hidden';
    },
    hide() { const el = document.getElementById('page-loader'); if(el) { el.remove(); document.body.style.overflow = ''; } },
    showButton(btn, msg='Processing...') {
        if(!btn) return;
        btn.dataset.originalContent = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<span class="button-spinner"></span><span>${msg}</span>`;
    },
    hideButton(btn) {
        if(!btn) return;
        if(btn.dataset.originalContent) btn.innerHTML = btn.dataset.originalContent;
        btn.disabled = false;
        delete btn.dataset.originalContent;
    },
    showSkeleton(containerId, count=3) {
        const c = document.getElementById(containerId);
        if(!c) return;
        c.innerHTML = Array(count).fill().map(()=>`<div class="skeleton-item"><div class="skeleton-line skeleton-title"></div><div class="skeleton-line skeleton-text"></div></div>`).join('');
    }
};

const ErrorHandler = {
    handle(error, context='An error occurred') {
        console.error(`[Error] ${context}:`, error);
        let msg = error.message || context;
        Toast.error(msg);
    }
};

// ============================================================
// 6. PAGE CONFIGURATION & CONTENT MANAGEMENT
// ============================================================

const PAGE_CONFIG = {
    landing: { name: 'Landing Page', path: 'index.html' },
    'about-us': { name: 'About Us', path: 'about-us.html' },
    impact: { name: 'Impact', path: 'impact.html' },
    'get-involved': { name: 'Get Involved', path: 'get-involved.html' },
    volunteer: { name: 'Volunteer', path: 'volunteer.html' },
    donate: { name: 'Donate', path: 'donate.html' },
    events: { name: 'Events', path: 'events.html' }
};
function getCurrentPageName() {
    const filename = window.location.pathname.split('/').pop();
    if (!filename || filename === 'index.html' || filename === '') return 'landing';
    const name = filename.replace('.html', '');
    return PAGE_CONFIG[name] ? name : name;
}

class ContentManager {
    constructor(api) { this.api = api; this.contentCache = {}; this.isDirty = false; this.pageName = getCurrentPageName(); }
    async updateContent(key, value, page=this.pageName) { const data = await this.api.post('/admin/content/update', { contentKey:key, contentValue:value, pageName:page }); this.contentCache[key]=value; this.isDirty=false; return data; }
    async batchUpdateContent(updates) { const data = await this.api.post('/admin/content/batch-update', { updates }); updates.forEach(u=>this.contentCache[u.contentKey]=u.contentValue); this.isDirty=false; return data; }
    async loadPageContent(page=this.pageName) { const map = await this.api.get(`/admin/content/page/${page}`) || {}; Object.assign(this.contentCache, map); return map; }
    markDirty() { this.isDirty=true; }
    hasUnsavedChanges() { return this.isDirty; }
    clearDirty() { this.isDirty=false; }
    getCachedContent() { return {...this.contentCache}; }
}

class AdminContentEditor {
    constructor(auth, manager) {
        this.auth = auth; this.manager = manager; this.currentEditElement = null; this.isEditMode = false; this.pageName = getCurrentPageName();
        if(this.manager) this.manager.pageName = this.pageName;
    }
    init() { this.setupListeners(); if(this.auth.isAuthenticated()) this.loadPageContent(); }
    setupListeners() {
        document.addEventListener('click', e => { if(e.target.classList?.contains('editable') && this.isEditMode) this.startEdit(e); });
        document.addEventListener('keydown', e => { if(e.key === 'Escape') this.cancelEdit(); });
    }
    async loadPageContent() { const content = await this.manager.loadPageContent(this.pageName); this.applyContent(content); }
    applyContent(map) { document.querySelectorAll('.editable').forEach(el => { const key = el.getAttribute('data-key'); if(key && map[key]) el.textContent = map[key]; }); }
    enableEditMode() { this.isEditMode = true; document.body.classList.add('edit-mode-active'); }
    disableEditMode() { this.isEditMode = false; document.body.classList.remove('edit-mode-active'); }
    startEdit(e) {
        e.stopPropagation();
        this.currentEditElement = e.target;
        const key = this.currentEditElement.getAttribute('data-key');
        const editor = document.getElementById('inlineEditor');
        if(!editor) return;
        const ta = document.getElementById('editorContent');
        ta.value = this.currentEditElement.textContent;
        editor.classList.add('active');
        const rect = this.currentEditElement.getBoundingClientRect();
        editor.style.top = (rect.top + window.scrollY - 120) + 'px';
        editor.style.left = Math.min(rect.left + window.scrollX, window.innerWidth - 350) + 'px';
        editor.dataset.contentKey = key;
        ta.focus();
    }
    saveEdit() {
        if(!this.currentEditElement) return;
        const editor = document.getElementById('inlineEditor');
        const ta = document.getElementById('editorContent');
        const newVal = ta.value.trim();
        const key = editor.dataset.contentKey;
        if(!newVal) return;
        this.currentEditElement.textContent = newVal;
        this.manager.markDirty();
        this.manager.contentCache[key] = newVal;
        this.cancelEdit();
    }
    cancelEdit() { const ed = document.getElementById('inlineEditor'); if(ed) ed.classList.remove('active'); this.currentEditElement = null; }
    async saveAllChanges() {
        if(!this.auth.isAuthenticated()) { alert('Login required'); return false; }
        const changes = this.manager.getCachedContent();
        if(Object.keys(changes).length===0 && !this.manager.hasUnsavedChanges()) { alert('No changes'); return false; }
        const updates = Object.entries(changes).map(([k,v])=>({ contentKey:k, contentValue:v, pageName:this.pageName }));
        try {
            await this.manager.batchUpdateContent(updates);
            alert('Saved!');
            this.manager.clearDirty();
            return true;
        } catch(e) { alert('Save failed'); return false; }
    }
}

class ImageManager {
    constructor(api) { this.api = api; }
    async uploadImage(file, imageKey, pageName, alt='', desc='', progressCb=null) {
        if(!this.api.authToken) throw new Error('Not authenticated');
        const formData = new FormData();
        formData.append('file', file); formData.append('imageKey', imageKey); formData.append('pageName', pageName);
        formData.append('altText', alt); formData.append('description', desc);
        return await this.api.uploadFile('/admin/images/upload', formData);
    }
    async getPageImages(pageName) { return (await this.api.get(`/admin/images/page/${pageName}`)).images || []; }
    async deleteImage(key) { return await this.api.delete(`/admin/images/${key}`); }
    async updateImageMetadata(key, alt, desc) { return await this.api.patch(`/admin/images/${key}?altText=${encodeURIComponent(alt||'')}`, {}); }
}

// ============================================================
// 7. PAGE-SPECIFIC MODULES (Admin Pages, Frontend Pages)
// ============================================================

const AdminProjects = {
    WARDS: ['Makadara','Kamukunji','Starehe','Mathare','Westlands','Dagoretti North','Dagoretti South','Lang\'ata','Kibra','Roysambu','Kasarani','Ruaraka','Embakasi South','Embakasi North','Embakasi Central','Embakasi East','Embakasi West','Makongeni'],
    init() { if(!authService.requireAdmin) authService.requireAdmin(); this.setupEventListeners(); this.loadProjects(); },
    setupEventListeners() { /* stub */ },
    async loadProjects() { const p = await ProjectService.getAll(); this.allProjects = p; this.filteredProjects = [...p]; this.renderProjects(); },
    renderProjects() { const tbody = document.getElementById('projects-tbody'); if(!tbody) return; tbody.innerHTML = this.filteredProjects.map(p=>`<tr><td>${p.name}</td><td>${p.status}</td><td>${p.ward}</td><td class="action-buttons"><button onclick="AdminProjects.editProject(${p.id})">Edit</button><button onclick="AdminProjects.deleteProject(${p.id})">Delete</button></td></tr>`).join(''); },
    editProject(id) { window.location.href=`?action=edit