/**
 * Format Utility
 * Formatting helpers for dates, currency, etc.
 */

const FormatUtil = {
    /**
     * Format date to readable string
     * Example: "Jan 15, 2024"
     */
    formatDate(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    },

    /**
     * Format datetime to readable string
     * Example: "Jan 15, 2024 at 2:30 PM"
     */
    formatDateTime(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString);
        const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };

        const datePart = date.toLocaleDateString('en-US', dateOptions);
        const timePart = date.toLocaleTimeString('en-US', timeOptions);

        return `${datePart} at ${timePart}`;
    },

    /**
     * Format currency (KES)
     * Example: "KES 1,500.00"
     */
    formatCurrency(amount) {
        if (amount === null || amount === undefined) return 'KES 0.00';

        const num = parseFloat(amount);
        if (isNaN(num)) return 'KES 0.00';

        return `KES ${num.toLocaleString('en-KE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    },

    /**
     * Format phone number
     * Example: "+254 712 345 678"
     */
    formatPhone(phone) {
        if (!phone) return '';

        // Remove all spaces and special characters
        const cleaned = phone.replace(/\D/g, '');

        // Convert to +254 format
        let formatted = cleaned;
        if (cleaned.startsWith('0')) {
            formatted = '254' + cleaned.substring(1);
        } else if (cleaned.startsWith('254')) {
            // Already in correct format
        } else if (cleaned.startsWith('+254')) {
            formatted = cleaned.substring(1);
        } else {
            formatted = '254' + cleaned;
        }

        // Add spaces: +254 712 345 678
        return `+${formatted.substring(0, 3)} ${formatted.substring(3, 6)} ${formatted.substring(6, 9)} ${formatted.substring(9)}`;
    },

    /**
     * Format number with commas
     * Example: "1,500"
     */
    formatNumber(number) {
        if (number === null || number === undefined) return '0';

        const num = parseFloat(number);
        if (isNaN(num)) return '0';

        return num.toLocaleString('en-US');
    },

    /**
     * Truncate text with ellipsis
     * Example: "This is a long text..." (max 20 chars)
     */
    truncateText(text, maxLength = 50) {
        if (!text) return '';
        if (text.length <= maxLength) return text;

        return text.substring(0, maxLength) + '...';
    },

    /**
     * Capitalize first letter
     * Example: "hello world" -> "Hello world"
     */
    capitalizeFirst(text) {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },

    /**
     * Convert to title case
     * Example: "hello world" -> "Hello World"
     */
    toTitleCase(text) {
        if (!text) return '';
        return text.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    },

    /**
     * Format status badge
     */
    getStatusClass(status) {
        const statusClasses = {
            'ACTIVE': 'status-active',
            'INACTIVE': 'status-inactive',
            'SUSPENDED': 'status-suspended',
            'PLANNED': 'status-planned',
            'ONGOING': 'status-ongoing',
            'COMPLETED': 'status-completed',
            'CANCELLED': 'status-cancelled',
            'PENDING': 'status-pending',
            'RECEIVED': 'status-received',
            'USED': 'status-used'
        };

        return statusClasses[status] || 'status-default';
    },

    /**
     * Format relative time
     * Example: "2 hours ago", "3 days ago"
     */
    formatRelativeTime(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

        return this.formatDate(dateString);
    },

    /**
     * Parse date for input field (YYYY-MM-DD)
     */
    toInputDate(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    },

    /**
     * Parse datetime for input field (YYYY-MM-DDTHH:mm)
     */
    toInputDateTime(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FormatUtil };
}