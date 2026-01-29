/**
 * Toast Notification Component
 * Shows temporary notification messages
 */

class ToastNotification {
    /**
     * Show success message
     * @param {string} message - Message to show
     * @param {number} duration - Duration in ms (default 3000)
     */
    static success(message, duration = 3000) {
        this.show(message, 'success', duration);
    }

    /**
     * Show error message
     * @param {string} message - Message to show
     * @param {number} duration - Duration in ms (default 4000)
     */
    static error(message, duration = 4000) {
        this.show(message, 'error', duration);
    }

    /**
     * Show info message
     * @param {string} message - Message to show
     * @param {number} duration - Duration in ms (default 3000)
     */
    static info(message, duration = 3000) {
        this.show(message, 'info', duration);
    }

    /**
     * Show toast notification
     * @param {string} message - Message to show
     * @param {string} type - Type (success, error, info)
     * @param {number} duration - Duration in ms
     * @private
     */
    static show(message, type, duration) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        // Add to page
        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);

        // Remove after duration
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

// Add toast CSS dynamically
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(400px);
        transition: transform 0.3s ease;
        z-index: 9999;
        max-width: 400px;
    }
    .toast.show {
        transform: translateX(0);
    }
    .toast-success {
        background: #27ae60;
    }
    .toast-error {
        background: #e74c3c;
    }
    .toast-info {
        background: #3498db;
    }
`;
document.head.appendChild(toastStyles);