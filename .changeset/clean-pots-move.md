---
"@repo/ui": minor
---

Add Sheet and Dropdown overlay components with full keyboard navigation and a11y

- Add Sheet adaptive overlay (Modal on desktop, Drawer on mobile via MediaQuery)
- Add Dropdown with arrow key navigation, auto-focus, and focus management
- Refactor overlay system to use CSS transitions, shared focus utilities, and simplified Drawer DOM
- Fix Drawer sizing using CSS variables instead of runtime measurement
