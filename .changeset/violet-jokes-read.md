---
"api": minor
---

Replaced Passport JWT with custom guards and hardened token validation

- Migrated from @nestjs/passport and passport-jwt to native AuthGuard and RefreshGuard with explicit JWT verification
- Added algorithm whitelist (HS256), issuer, and audience validation to prevent token misuse
- Updated API documentation with current guards order
