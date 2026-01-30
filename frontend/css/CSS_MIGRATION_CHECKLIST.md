CSS Consolidation - Migration Checklist
📋 Overview
This checklist tracks the consolidation of CSS files to use centralized tokens and eliminate duplicates.

✅ Phase 0: Preparation (COMPLETED)

 Create tokens.css with all design system variables
 Create CSS_ARCHITECTURE.md documentation
 Document CSS load order convention
 Create migration checklist


🔄 Phase 1: Quick Wins (IN PROGRESS)
1.1 Add Tokens File (COMPLETED)

 Create /css/tokens.css
 Define canonical color variables
 Add legacy aliases for backward compatibility
 Define spacing, typography, shadows, transitions
 Document breakpoints

1.2 Update HTML Files to Include Tokens
Priority: HIGH | Effort: LOW | Time: 30-45 minutes
Update <head> section in these files to load tokens.css FIRST:
Public Pages:

 index.html
 pages/login.html
 pages/register.html
 pages/volunteer.html
 pages/donate.html
 pages/projects.html
 pages/events.html

Admin Pages:

 pages/admin/dashboard.html
 pages/admin/projects.html
 pages/admin/events.html
 pages/admin/donations.html
 pages/admin/users.html
 pages/admin/activity.html

Template:
html<head>
    <!-- 1. Design Tokens FIRST -->
    <link rel="stylesheet" href="../../css/tokens.css">
    
    <!-- 2. Global Styles -->
    <link rel="stylesheet" href="../../css/main.css">
    
    <!-- 3. Components -->
    <link rel="stylesheet" href="../../css/components.css">
    
    <!-- 4. Page-Specific -->
    <link rel="stylesheet" href="../../css/pages/your-page.css">
</head>
1.3 Remove Duplicate Keyframes
Priority: HIGH | Effort: LOW | Time: 15 minutes

 Keep @keyframes spin in components.css only
 Remove from css/main.css (if exists)
 Remove from css/pages/admin/admin.css (if exists)
 Search for other duplicate keyframes:

 @keyframes fadeIn
 @keyframes slideIn
 @keyframes pulse



Command to find duplicates:
bashgrep -r "@keyframes" css/ --include="*.css"
1.4 Consolidate Modal Styles
Priority: HIGH | Effort: MEDIUM | Time: 20-30 minutes

 Keep canonical .modal, .modal-content, .modal-header in components.css
 Remove duplicate modal styles from:

 css/main.css
 css/pages/admin/admin.css


 Verify all pages still render modals correctly
 Test modal animations and backdrop


🎨 Phase 2: Token Migration (NEXT)
2.1 Migrate Color Variables
Priority: HIGH | Effort: MEDIUM | Time: 45-90 minutes
Replace old color variables with canonical tokens:
Files to Update:

 css/main.css

Replace: --primary-color, --primary, --primary-blue → var(--color-primary)
Replace: --success-color → var(--color-success)
Replace: --error-color → var(--color-error)
Replace: --text-color → var(--color-text-primary)
Replace: --bg-gray → var(--color-bg-secondary)


 css/components.css

Same replacements as above
Update button color references
Update badge color references
Update status color references


 css/pages/admin/admin.css

Replace: --admin-primary → var(--color-primary)
Replace: --admin-accent → var(--color-secondary)
Update sidebar colors
Update header colors



Find & Replace Commands:
bash# Find all custom color definitions
grep -r "\-\-[a-zA-Z\-]*color:" css/

# Find hex color codes
grep -r "#[0-9a-fA-F]\{6\}" css/
2.2 Migrate Spacing Values
Priority: MEDIUM | Effort: MEDIUM | Time: 30-45 minutes
Replace hard-coded spacing with tokens:

 Replace padding: 16px → padding: var(--spacing-4)
 Replace margin: 24px → margin: var(--spacing-6)
 Replace gap: 8px → gap: var(--spacing-2)

Files to Update:

 css/main.css
 css/components.css
 css/pages/admin/admin.css

2.3 Migrate Border Radius
Priority: LOW | Effort: LOW | Time: 15 minutes

 Replace border-radius: 8px → border-radius: var(--radius-base)
 Replace border-radius: 4px → border-radius: var(--radius-sm)
 Replace border-radius: 16px → border-radius: var(--radius-lg)

2.4 Migrate Shadows
Priority: LOW | Effort: LOW | Time: 15 minutes

 Replace shadow definitions with var(--shadow-sm), var(--shadow-md), etc.
 Update card shadows
 Update modal shadows
 Update dropdown shadows


🧩 Phase 3: Component Consolidation
3.1 Standardize Button Styles
Priority: HIGH | Effort: MEDIUM | Time: 30-45 minutes

 Define canonical .btn in components.css
 Remove duplicate .btn from:

 css/main.css
 Other page CSS files


 Verify all button variants:

 .btn-primary
 .btn-secondary
 .btn-outline
 .btn-error
 .btn-success
 .btn-sm, .btn-lg


 Test buttons on all pages

3.2 Standardize Form Elements
Priority: MEDIUM | Effort: MEDIUM | Time: 30 minutes

 Define canonical .form-control in components.css
 Define canonical .form-group styles
 Remove duplicates from page CSS
 Test forms on all pages

3.3 Standardize Status Badges
Priority: MEDIUM | Effort: LOW | Time: 20 minutes

 Define canonical .status-badge in components.css
 Define variants:

 .status-success
 .status-warning
 .status-error
 .status-info


 Remove duplicates from admin CSS
 Test badges on all pages

3.4 Standardize Cards
Priority: MEDIUM | Effort: LOW | Time: 20 minutes

 Keep canonical .card in components.css
 Standardize .card-header, .card-body, .card-footer
 Remove duplicates
 Test card layouts


🔧 Phase 4: Admin CSS Consolidation
4.1 Create Centralized Admin CSS
Priority: MEDIUM | Effort: MEDIUM | Time: 45-60 minutes

 Ensure css/pages/admin/admin.css exists
 Move common admin styles to this file
 Use .admin- prefix for admin-specific components
 Remove duplicates from individual admin page CSS

4.2 Admin Component Scoping
Priority: LOW | Effort: MEDIUM | Time: 30 minutes
Prefix admin components to avoid global conflicts:

 .admin-sidebar
 .admin-header
 .admin-nav
 .admin-content
 .admin-footer

4.3 Update Admin HTML
Priority: LOW | Effort: LOW | Time: 20 minutes

 Update admin page HTML to use prefixed classes
 Verify no conflicts with global styles
 Test responsive layouts


🧹 Phase 5: Cleanup
5.1 Remove Duplicate Resets
Priority: LOW | Effort: LOW | Time: 15 minutes

 Keep one reset in main.css
 Remove * { margin: 0; padding: 0; } from:

 Page CSS files
 Admin CSS files


 Verify no layout breaks

5.2 Remove Unused CSS Files
Priority: LOW | Effort: LOW | Time: 15 minutes

 Identify unused CSS files
 Archive or delete:

 Old duplicate files
 Unmaintained page CSS


 Update HTML references

5.3 Consolidate Media Queries
Priority: LOW | Effort: MEDIUM | Time: 30 minutes

 Standardize breakpoint values to match tokens
 Replace @media (max-width: 768px) with consistent breakpoints
 Use mobile-first approach everywhere


🎯 Phase 6: Enforcement & Documentation
6.1 Add CSS Linting
Priority: LOW | Effort: MEDIUM | Time: 60 minutes

 Create .stylelintrc.json
 Add basic rules:

 No hard-coded colors
 No duplicate selectors
 Require CSS custom properties


 Add to CI/CD pipeline
 Fix linting errors

6.2 Update Team Documentation
Priority: MEDIUM | Effort: LOW | Time: 20 minutes

 Update main README with CSS guidelines
 Add link to CSS_ARCHITECTURE.md
 Create onboarding guide for new developers
 Document common patterns

6.3 Create Code Review Checklist
Priority: LOW | Effort: LOW | Time: 15 minutes
CSS changes must:

 Use design tokens
 Follow load order
 Not duplicate existing components
 Pass linting
 Be tested on mobile and desktop


📊 Progress Tracking
Current Status

Phase 0: ✅ Complete (100%)
Phase 1: 🔄 In Progress (20%)
Phase 2: ⏳ Not Started (0%)
Phase 3: ⏳ Not Started (0%)
Phase 4: ⏳ Not Started (0%)
Phase 5: ⏳ Not Started (0%)
Phase 6: ⏳ Not Started (0%)

Overall Progress: 15% Complete

🚀 Quick Start
To begin migration:

Start with Phase 1.2: Update HTML files to include tokens.css
Then Phase 1.3: Remove duplicate keyframes
Then Phase 2.1: Migrate color variables in one file at a time
Test each change: Verify no visual regressions


📝 Notes

Always test on at least 2 pages after each change
Keep browser dev tools open to catch CSS errors
Clear cache between tests (Ctrl+Shift+R)
Take screenshots before/after for visual comparison
Commit after each completed section


🆘 Rollback Plan
If something breaks:

Revert the last commit: git revert HEAD
Clear browser cache
Check CSS load order in HTML
Verify tokens.css is loading
Check for typos in variable names


✅ Completion Criteria
Migration is complete when:

 All HTML files load tokens.css first
 No duplicate component definitions
 All colors use design tokens
 All spacing uses design tokens
 No visual regressions on any page
 CSS linting passes
 Team documentation is updated
 All pages tested on mobile and desktop