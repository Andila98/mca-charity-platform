# CSS Load Order

To ensure a consistent and predictable styling cascade, all HTML pages should include stylesheets in the following order:

1.  **`tokens.css`**:
    *   **Purpose**: Defines all global CSS variables (design tokens) for colors, spacing, typography, etc.
    *   **Location**: `frontend/css/tokens.css`
    *   **Note**: This file should always be loaded first to make variables available to all other stylesheets.

2.  **`main.css`**:
    *   **Purpose**: Contains global styles, resets, and base element styling (e.g., `body`, `h1`, `.container`).
    *   **Location**: `frontend/css/main.css`

3.  **`components.css`**:
    *   **Purpose**: Contains styles for reusable UI components (e.g., modals, buttons, loaders).
    *   **Location**: `frontend/css/components.css`

4.  **Page-Specific CSS**:
    *   **Purpose**: Contains styles that are unique to a single page.
    *   **Location**: Varies (e.g., `frontend/css/pages/about-us.css`, `frontend/css/pages/admin/dashboard.css`).

## Example Implementation

```html
<head>
    ...
    <link rel="stylesheet" href="path/to/css/tokens.css">
    <link rel="stylesheet" href="path/to/css/main.css">
    <link rel="stylesheet" href="path/to/css/components.css">
    <link rel="stylesheet" href="path/to/css/pages/my-page.css">
    ...
</head>
```
