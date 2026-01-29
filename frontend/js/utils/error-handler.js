/**
 * Error Handler Utility
 * Central error handling and logging
 */

const ErrorHandler = {
    /**
     * Handle error and show user-friendly message
     */
    handle(error, context = 'An error occurred') {
        console.error(`[Error] ${context}:`, error);

        let userMessage = context;

        // Extract user-friendly message from error
        if (error.message) {
            userMessage = error.message;
        } else if (typeof error === 'string') {
            userMessage = error;
        }

        // Show toast notification if available
        if (typeof Toast !== 'undefined') {
            Toast.error(userMessage);
        } else {
            alert(userMessage);
        }
    },

    /**
     * Handle validation errors
     */
    handleValidation(errors, formId) {
        if (!errors || typeof errors !== 'object') return;

        Object.keys(errors).forEach(fieldId => {
            const errorMessages = errors[fieldId];
            if (Array.isArray(errorMessages) && errorMessages.length > 0) {
                ValidationUtil.showFieldError(fieldId, errorMessages[0]);
            }
        });
    },

    /**
     * Handle network errors
     */
    handleNetworkError() {
        this.handle(
            new Error('Network error - please check your internet connection'),
            'Connection Error'
        );
    },

    /**
     * Handle unauthorized access
     */
    handleUnauthorized() {
        this.handle(
            new Error('You are not authorized to perform this action'),
            'Unauthorized'
        );

        // Redirect to login after delay
        setTimeout(() => {
            window.location.href = '/pages/login.html';
        }, 2000);
    },

    /**
     * Handle not found errors
     */
    handleNotFound(resource = 'Resource') {
        this.handle(
            new Error(`${resource} not found`),
            'Not Found'
        );
    }
};






