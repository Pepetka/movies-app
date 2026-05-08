---
"web": minor
---

Replace registration with OAuth-only authentication and enhance UI flow

- Add OAuthSection component and integrate into login and auth pages
- Implement OAuth redirect flow with automatic CSRF handling in API client
- Improve OAuth store API, success handling, and SvelteKit navigation
- Harden OAuth security, types, and remove legacy registration code
