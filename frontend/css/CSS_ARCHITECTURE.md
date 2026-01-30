CSS Architecture Guide
📋 Overview
This project uses a centralized token-based CSS architecture to ensure consistency, maintainability, and scalability across all pages.

🏗️ File Structure
css/
├── tokens.css           ⭐ Design system tokens (LOAD FIRST)
├── main.css            → Global styles & resets
├── components.css      → Reusable components (buttons, modals, etc.)
├── pages/
│   ├── admin/
│   │   └── admin.css   → Admin-specific styles
│   └── [page].css      → Page-specific overrides
└── [legacy].css        → Legacy files (being migrated)

📦 CSS Load Order (CRITICAL)
Always include CSS files in this exact order:
html<head>
    <!-- 1. Design Tokens (FIRST) -->
    <link rel="stylesheet" href="/css/tokens.css">
    
    <!-- 2. Global Styles -->
    <link rel="stylesheet" href="/css/main.css">
    
    <!-- 3. Components -->
    <link rel="stylesheet" href="/css/components.css">
    
    <!-- 4. Page-Specific (LAST) -->
    <link rel="stylesheet" href="/css/pages/your-page.css">
</head>
Why this order matters:

Tokens define variables used by all other files
Main provides base styles and reset
Components provide reusable UI elements
Page-specific styles override when needed


🎨 Design Tokens
Color System
Primary Palette:
css--color-primary         /* Main brand color: #2563eb */
--color-primary-50      /* Lightest tint */
--color-primary-600     /* Base (same as --color-primary) */
--color-primary-900     /* Darkest shade */
Semantic Colors:
css--color-success         /* #10b981 */
--color-error          /* #ef4444 */
--color-warning        /* #f59e0b */
--color-info           /* #3b82f6 */
Text Colors:
css--color-text-primary    /* Body text */
--color-text-secondary  /* Muted text */
--color-text-tertiary   /* Disabled/placeholder */
Background Colors:
css--color-bg-primary      /* Main background */
--color-bg-secondary    /* Section backgrounds */
--color-bg-tertiary     /* Card backgrounds */
Spacing Scale
css--spacing-1    /* 4px */
--spacing-2    /* 8px */
--spacing-3    /* 12px */
--spacing-4    /* 16px */
--spacing-6    /* 24px */
--spacing-8    /* 32px */
--spacing-12   /* 48px */
Border Radius
css--radius-sm     /* 4px - small elements */
--radius-base   /* 8px - default */
--radius-lg     /* 16px - cards */
--radius-full   /* 9999px - pills/circles */
Shadows
css--shadow-sm     /* Subtle elevation */
--shadow-base   /* Default cards */
--shadow-md     /* Dropdowns */
--shadow-lg     /* Modals */
Breakpoints
Mobile:     0-575px
Tablet:     576-767px
Desktop:    768-991px
Large:      992-1199px
XL:         1200px+
Media Query Usage:
css/* Mobile-first approach */
.element {
    /* Mobile styles */
}

@media (min-width: 768px) {
    /* Tablet and up */
}

@media (min-width: 992px) {
    /* Desktop and up */
}

🧩 Component Classes
Buttons
html<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-outline">Outline</button>
<button class="btn btn-sm">Small</button>
<button class="btn btn-lg">Large</button>
Status Badges
html<span class="status-badge status-success">Success</span>
<span class="status-badge status-warning">Warning</span>
<span class="status-badge status-error">Error</span>
Cards
html<div class="card">
    <div class="card-header">
        <h3>Card Title</h3>
    </div>
    <div class="card-body">
        Content here
    </div>
</div>
Modals
html<div class="modal">
    <div class="modal-backdrop"></div>
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">...</div>
            <div class="modal-body">...</div>
            <div class="modal-footer">...</div>
        </div>
    </div>
</div>

🎯 Naming Conventions
BEM-inspired Naming
css/* Block */
.card { }

/* Block Element */
.card-header { }
.card-body { }

/* Block Modifier */
.card--highlighted { }

/* Element Modifier */
.card-header--large { }
Utility Classes
css/* Spacing */
.mt-4    /* margin-top: 1rem */
.p-6     /* padding: 1.5rem */

/* Display */
.flex
.grid
.hidden

/* Text */
.text-center
.text-primary
.font-bold
State Classes
css.is-active
.is-disabled
.is-loading
.has-error

🔧 Migration Guide
Phase 1: Update Color Variables
Before:
css.element {
    color: #2563eb;
    background: --primary-blue;
}
After:
css.element {
    color: var(--color-primary);
    background: var(--color-primary);
}
Phase 2: Use Spacing Scale
Before:
css.element {
    margin: 16px;
    padding: 24px;
}
After:
css.element {
    margin: var(--spacing-4);
    padding: var(--spacing-6);
}
Phase 3: Standardize Components
Before:
css/* Multiple button definitions across files */
.btn { padding: 10px 20px; }
.button { padding: 0.5rem 1rem; }
After:
css/* Single definition in components.css */
.btn {
    padding: var(--button-padding-base);
    border-radius: var(--button-border-radius);
}

🚫 What NOT to Do
❌ Don't Define New Colors
css/* BAD */
.custom-element {
    color: #1a73e8;  /* Random hex value */
}

/* GOOD */
.custom-element {
    color: var(--color-primary);
}
❌ Don't Create Duplicate Components
css/* BAD - Don't redefine in page CSS */
.my-button {
    /* Duplicate button styles */
}

/* GOOD - Extend existing component */
.btn-custom {
    /* Only custom properties */
    background-image: linear-gradient(...);
}
❌ Don't Use Magic Numbers
css/* BAD */
.element {
    padding: 13px;
    margin: 27px;
}

/* GOOD */
.element {
    padding: var(--spacing-3);
    margin: var(--spacing-6);
}
❌ Don't Skip the CSS Load Order
html<!-- BAD -->
<link rel="stylesheet" href="/css/main.css">
<link rel="stylesheet" href="/css/tokens.css"> ❌

<!-- GOOD -->
<link rel="stylesheet" href="/css/tokens.css">
<link rel="stylesheet" href="/css/main.css"> ✅

📊 Admin Pages
Admin pages use a scoped prefix to avoid conflicts:
css/* Admin-specific styles */
.admin-sidebar { }
.admin-header { }
.admin-content { }
Admin CSS Load Order:
html<link rel="stylesheet" href="/css/tokens.css">
<link rel="stylesheet" href="/css/main.css">
<link rel="stylesheet" href="/css/components.css">
<link rel="stylesheet" href="/css/pages/admin/admin.css">

🧪 Testing Checklist
Before committing CSS changes:

 All pages load without visual regressions
 No console errors related to missing CSS variables
 Responsive layouts work on mobile (375px) and desktop (1200px+)
 Colors match the design system
 Shadows and spacing use token variables
 No duplicate component definitions


🔍 Finding Issues
Check for Duplicate Definitions
bash# Find duplicate @keyframes
grep -r "@keyframes" css/

# Find duplicate button styles
grep -r "\.btn {" css/

# Find hard-coded colors
grep -r "#[0-9a-fA-F]\{6\}" css/
Check CSS Load Order
View source on any page and verify:

tokens.css loads first
main.css loads second
components.css loads third
Page-specific CSS loads last


📚 Resources

CSS Custom Properties (MDN)
BEM Naming Convention
CSS Architecture Best Practices


🆘 Help & Support
Common Issues:

Colors not applying: Check if tokens.css is loaded first
Styles not updating: Clear browser cache or hard refresh (Ctrl+Shift+R)
Conflicts between files: Check CSS specificity and load order
Mobile layout broken: Verify media query breakpoints match tokens

Need Help?

Check this guide first
Review existing code in components.css
Ask the team in #frontend channel


✅ Summary
DO:

✅ Use design tokens for all values
✅ Follow the CSS load order
✅ Extend existing components
✅ Use semantic color names
✅ Follow mobile-first approach

DON'T:

❌ Hard-code colors or spacing
❌ Create duplicate components
❌ Skip tokens.css
❌ Use random breakpoints
❌ Ignore naming conventions

Remember: Consistency is key! When in doubt, check tokens.css and components.css first.