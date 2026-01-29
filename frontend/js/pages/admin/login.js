document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('admin-login-form');
    const errorContainer = document.getElementById('login-error');
    const loginButton = document.getElementById('login-btn');

    // Check if already logged in and redirect
    if (localStorage.getItem('admin_token')) {
        window.location.href = 'dashboard.html';
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        // Clear previous errors
        errorContainer.textContent = '';

        // Disable button
        const originalButtonText = loginButton.textContent;
        loginButton.disabled = true;
        loginButton.textContent = 'Logging in...';

        try {
            // Use the global adminAuthService
            if (typeof adminAuthService === 'undefined') {
                throw new Error('Authentication service not loaded.');
            }

            await adminAuthService.login(username, password);

            // Redirect to dashboard on success
            window.location.href = 'dashboard.html';

        } catch (error) {
            errorContainer.textContent = error.message || 'An unknown error occurred.';
            loginButton.disabled = false;
            loginButton.textContent = originalButtonText;
        }
    });
});
