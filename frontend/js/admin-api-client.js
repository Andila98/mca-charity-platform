(function(window){
    class AdminAPIClient {
        constructor(authService, baseURL = 'http://localhost:8080/api') {
            this.authService = authService;
            this.baseURL = baseURL; // e.g. http://localhost:8080/api
        }

        async request(endpoint, options = {}) {
            const token = this.authService && this.authService.getToken && this.authService.getToken();

            const config = {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                    ...(options.headers || {})
                }
            };

            const response = await fetch(`${this.baseURL}${endpoint}`, config);

            if (response.status === 401) {
                if (this.authService && typeof this.authService.logout === 'function') {
                    this.authService.logout();
                }
                // Redirect to home/login
                window.location.href = '/index.html';
                throw new Error('Unauthorized');
            }

            if (!response.ok) {
                // try to extract message
                let errorText = '';
                try {
                    const json = await response.json();
                    errorText = json && json.message ? json.message : JSON.stringify(json);
                } catch (e) {
                    errorText = await response.text().catch(() => response.statusText || 'Error');
                }
                throw new Error(errorText || `Request failed: ${response.status}`);
            }

            // 204 No Content
            if (response.status === 204) return null;

            return await response.json();
        }
    }

    window.AdminAPIClient = AdminAPIClient;
})(window);
