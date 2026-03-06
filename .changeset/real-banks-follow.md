---
"web": minor
---

Full authentication system implementation

- Add auth module: store, API functions, zod validation, navigation helpers
- Login and register pages with premium design
- Protected routes `(app)` with BottomNav
- Placeholder pages: groups, profile, settings
- Redesigned landing page with animated background
- HttpClient: add timeout for CSRF/refresh requests, set Content-Type only when body exists
- Add utilities: debounce, routes
- Add dependencies: `@lucide/svelte`, `zod`
