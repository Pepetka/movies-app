---
"web": minor
---

Added theming system and UI kit integration

- Implemented theme system (light/dark/system) with FOUC prevention via inline script in app.html
- Integrated UI kit components: UIProvider, ThemeToggle, StatusIndicator
- Redesigned layout: fixed header with container, centralized styles via CSS variables
- Replaced legacy HealthCheck component with StatusIndicator
