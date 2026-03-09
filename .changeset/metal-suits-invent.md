---
"web": minor
---

Add groups module with list view and integrate TopBar into app layout

- Groups store and API methods for CRUD operations
- Routes: /groups, /groups/new, /groups/[id] with PagePlaceholder
- BaseStore class and topBarStore for cross-component state
- TopBar integrated into app layout, visibility controlled via store
- Groups list with skeleton loading and empty state
