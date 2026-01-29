/**
 * Loader Component
 * Shows loading indicators
 */

const Loader = {
    /**
     * Show full-page loader
     */
    show(message = 'Loading...') {
        // Remove existing loader
        this.hide();

        const loader = document.createElement('div');
        loader.id = 'page-loader';
        loader.className = 'page-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="spinner"></div>
                <p class="loader-message">${message}</p>
            </div>
        `;

        document.body.appendChild(loader);
        document.body.style.overflow = 'hidden';
    },

    /**
     * Hide full-page loader
     */
    hide() {
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.remove();
            document.body.style.overflow = '';
        }
    },

    /**
     * Show button loader
     */
    showButton(buttonElement, message = 'Processing...') {
        if (!buttonElement) return;

        // Save original content
        buttonElement.dataset.originalContent = buttonElement.innerHTML;
        buttonElement.dataset.originalDisabled = buttonElement.disabled;

        // Disable button and show loader
        buttonElement.disabled = true;
        buttonElement.innerHTML = `
            <span class="button-spinner"></span>
            <span>${message}</span>
        `;
    },

    /**
     * Hide button loader
     */
    hideButton(buttonElement) {
        if (!buttonElement) return;

        // Restore original content
        if (buttonElement.dataset.originalContent) {
            buttonElement.innerHTML = buttonElement.dataset.originalContent;
        }

        if (buttonElement.dataset.originalDisabled === 'false') {
            buttonElement.disabled = false;
        }

        delete buttonElement.dataset.originalContent;
        delete buttonElement.dataset.originalDisabled;
    },

    /**
     * Show inline loader in a container
     */
    showInline(containerId, message = 'Loading...') {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="inline-loader">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
    },

    /**
     * Show skeleton loader
     */
    showSkeleton(containerId, count = 3) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let skeletons = '';
        for (let i = 0; i < count; i++) {
            skeletons += `
                <div class="skeleton-item">
                    <div class="skeleton-line skeleton-title"></div>
                    <div class="skeleton-line skeleton-text"></div>
                    <div class="skeleton-line skeleton-text"></div>
                </div>
            `;
        }

        container.innerHTML = skeletons;
    }
};