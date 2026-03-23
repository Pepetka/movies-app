# API Documentation

## Base URL

- **API:** `/api/v1/...`
- **Swagger:** `/api/docs` (non-production only)

## Authentication

### JWT Two-Token Scheme

- **Access Token:** Short-lived (15m), stored in memory, sent via `Authorization: Bearer <token>`
- **Refresh Token:** Long-lived (7d), stored in httpOnly cookie, rotated on refresh

### Auth Flow

```
Login → { accessToken, user } + refresh cookie
       ↓
API call with Authorization header
       ↓
401 → Auto-refresh via POST /auth/refresh (cookie + CSRF)
       ↓
New accessToken returned, retry original request
```

### CSRF Protection

- CSRF token required for mutations
- `GET /csrf/token` — obtain token (public endpoint)
- Include as `X-CSRF-Token` header in POST/PUT/PATCH/DELETE

## Guards (execution order)

1. **ThrottlerGuard** — Rate limiting (disabled in test)
2. **CsrfGuard** — CSRF protection (disabled in test)
3. **AuthGuard** — JWT validation (bypass with `@Public()`)
4. **RolesGuard** — Role-based access (`@Roles('admin')`)
5. **GroupMemberGuard** — Group membership check
6. **GroupModeratorGuard** — Moderator or admin in group
7. **GroupAdminGuard** — Group admin only

## Roles

### Global Roles (users table)

| Role  | Access |
| ----- | ------ |
| USER  | Own profile, groups, movies |
| ADMIN | All users, all groups, admin panel |

### Group Roles (group_members table)

| Role      | View | Add Movies | Manage Members | Delete Group |
| --------- | :--: | :--------: | :------------: | :----------: |
| member    | ✅   | ❌         | ❌             | ❌           |
| moderator | ✅   | ✅         | add/remove     | ❌           |
| admin     | ✅   | ✅         | full           | ✅           |

## Rate Limiting

| Tier   | Limit                   | Use case        |
| ------ | ----------------------- | --------------- |
| short  | 3 requests / 1 second   | Critical endpoints |
| medium | 20 requests / 10 seconds | Refresh tokens |
| long   | 100 requests / 60 seconds | General       |

## Endpoints Overview

### Auth (`/auth`)

| Method | Endpoint   | Access  | Description |
| ------ | ---------- | ------- | ----------- |
| POST   | /register  | Public  | Create account |
| POST   | /login     | Public  | Get tokens |
| POST   | /refresh   | Public  | Refresh access (cookie) |
| POST   | /logout    | Auth    | Invalidate session |

### Users (`/users`)

| Method | Endpoint | Access  | Description |
| ------ | -------- | ------- | ----------- |
| GET    | /me      | Auth    | Current user |
| GET    | /        | Admin   | List users |
| POST   | /        | Admin   | Create user |
| PATCH  | /:id     | Owner/Admin | Update user |
| DELETE | /:id     | Owner/Admin | Delete user |

### Groups (`/groups`)

| Method | Endpoint              | Access      | Description |
| ------ | --------------------- | ----------- | ----------- |
| GET    | /                     | Auth        | My groups |
| GET    | /all                  | Admin       | All groups |
| POST   | /                     | Auth        | Create group |
| GET    | /:id                  | Member      | Group details |
| PATCH  | /:id                  | Moderator+  | Update group |
| DELETE | /:id                  | Group Admin | Delete group |

### Group Members (`/groups/:id/members`)

| Method | Endpoint            | Access      | Description |
| ------ | ------------------- | ----------- | ----------- |
| GET    | /                   | Member      | List members |
| POST   | /                   | Moderator+  | Add member |
| PATCH  | /:userId            | Group Admin | Update role |
| DELETE | /:userId            | Group Admin | Remove member |
| DELETE | /me                 | Member      | Leave group |
| POST   | /transfer-ownership | Group Admin | Transfer ownership |

### Group Movies (`/groups/:id/movies`)

| Method | Endpoint        | Access      | Description |
| ------ | --------------- | ----------- | ----------- |
| GET    | /               | Member      | List all movies in group |
| GET    | /search         | Member      | Search (Kinopoisk + group) |
| POST   | /               | Moderator+  | Add provider movie |
| POST   | /custom          | Moderator+  | Create custom movie |
| GET    | /:id             | Member      | Movie details |
| PATCH  | /:id             | Moderator+  | Update status/data |
| DELETE | /:id             | Moderator+  | Remove movie |

### Movies (`/movies`)

| Method | Endpoint  | Access  | Description |
| ------ | --------- | ------- | ----------- |
| GET    | /search   | Public  | Search Kinopoisk |
| GET    | /         | Admin   | List all movies |
| POST   | /         | Admin   | Create movie |
| GET    | /:id      | Auth    | Movie details |
| PATCH  | /:id      | Admin   | Update movie |
| DELETE | /:id      | Admin   | Delete movie |

## Example Requests

```bash
# Health check
curl http://localhost:8080/api/v1/health

# Register
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"user@example.com","password":"SecurePass123!"}'

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'

# Get current user
curl http://localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer <access_token>"
```

## Decorators

| Decorator | Description |
| --------- | ----------- |
| `@Public()` | Bypass AuthGuard |
| `@Roles(...roles)` | Required roles |
| `@User()` | Get current user from request |
| `@UserId()` | Get current user id |
| `@Cookies()` | Get cookies |
| `@Author()` | Set author for audit |
