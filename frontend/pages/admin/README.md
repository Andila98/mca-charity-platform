# Admin Section

This directory contains all pages and assets related to the admin dashboard and management interface.

## Structure

- `dashboard.html`: The main dashboard page.
- `login.html`: The dedicated admin login page.
- `*.html`: Other admin pages for managing specific resources (e.g., `users.html`, `projects.html`).

## Required Scripts and Globals

For the admin pages to function correctly, several scripts must be loaded in the correct order. These scripts expose global objects that the page logic depends on.

### Script Loading Order

1.  `js/services/api.service.js`: Must be loaded first. It creates the `adminAPI` and `publicAPI` global instances.
2.  `js/utils/*.js`: Shared utility functions.
3.  `js/components/*.js`: Reusable UI components like `Modal`, `Loader`, and `Toast`.
4.  `js/services/admin-auth.js` (or `admin-auth-service.js`): Creates the `adminAuthService` global.
5.  `js/services/admin.service.js`: Creates the `AdminService` global.
6.  `js/pages/admin/*.js`: The specific logic for the current admin page.

### Required Globals

The following global variables are expected to be available on the `window` object:

- `adminAPI`: The low-level API client for making authenticated requests to the admin backend.
- `publicAPI`: The API client for public-facing endpoints.
- `adminAuthService`: The service for handling admin authentication (login, logout, token management).
- `AdminService`: The service for admin-specific business logic (e.g., approving users).
- `Modal`: A component for showing and hiding modals.
- `Loader`: A component for showing loading indicators.
- `Toast`: A component for displaying toast notifications.

## Local Development

It is assumed that the backend API is running at `http://localhost:8080` during local development. The `baseURL` for the API clients is configured in `js/services/api.service.js`.
