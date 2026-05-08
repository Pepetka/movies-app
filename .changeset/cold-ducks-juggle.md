---
"api": minor
---

Implement Google OAuth authentication with enhanced security and token management

- Add Google OAuth login flow with redirect support and callback validation
- Introduce TokenService and OAuthCookieService for centralized auth token handling
- Harden session security with CSRF-protected logout and race condition fixes
- Add OAuth exception hierarchy and dedicated service layer for maintainability
- Expand test coverage for OAuth user creation and E2E scenarios
