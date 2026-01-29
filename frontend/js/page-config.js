/**
 * Page Configuration
 * Defines settings and content keys for each page in the CMS
 */

const PAGE_CONFIG = {
    'landing': {
        name: 'Landing Page',
        path: 'index.html'
    },
    'about-us': {
        name: 'About Us',
        path: 'about-us.html'
    },
    'impact': {
        name: 'Impact',
        path: 'impact.html'
    },
    'get-involved': {
        name: 'Get Involved',
        path: 'get-involved.html'
    },
    'volunteer': {
        name: 'Volunteer',
        path: 'volunteer.html'
    },
    'donate': {
        name: 'Donate',
        path: 'donate.html'
    },
    'events': {
        name: 'Events',
        path: 'events.html'
    }
};

/**
 * Get the current page name based on the URL
 * @returns {string} Page key (e.g., 'landing', 'about-us')
 */
function getCurrentPageName() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();

    if (!filename || filename === 'index.html' || filename === '') {
        return 'landing';
    }

    // Remove .html extension
    const nameWithoutExt = filename.replace('.html', '');

    // Check if it exists in config
    if (PAGE_CONFIG[nameWithoutExt]) {
        return nameWithoutExt;
    }

    // Handle potential URL encoding or mismatches
    // e.g. "about%20us" -> "about-us" mapping if needed, but we standardized filenames.

    return nameWithoutExt; // Default to filename as key
}

// Export for module usage if needed, but currently we use global scope
window.PAGE_CONFIG = PAGE_CONFIG;
window.getCurrentPageName = getCurrentPageName;
