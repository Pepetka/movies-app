# Future Improvements

## HTTP Client

### Exponential Backoff

Current: Fixed 1s delay between retries.

**Goal:** Implement exponential backoff with jitter.

```typescript
const backoff = (attempt: number, baseDelay: number = 1000) => {
  const delay = baseDelay * Math.pow(2, attempt - 1);
  const jitter = delay * 0.2 * Math.random();
  return delay + jitter;
};
```

### Retry-After Header

Current: No special handling for 429.

**Goal:** Parse `Retry-After` header and wait before retry.

```typescript
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  if (retryAfter) {
    const waitMs = parseInt(retryAfter) * 1000;
    await sleep(waitMs);
  }
}
```

### Proactive Token Refresh

Current: Refresh only on 401.

**Goal:** Refresh access token before expiry (e.g., at 80% of lifetime).

```typescript
// Check token expiry before request
const tokenPayload = decodeJwt(accessToken);
const expiresAt = tokenPayload.exp * 1000;
const now = Date.now();
const shouldRefresh = (expiresAt - now) < (tokenLifetime * 0.2);

if (shouldRefresh) {
  await refreshToken();
}
```

## Frontend

### Dark Mode

Add theme switching with CSS custom properties.

### PWA

- Service worker for offline support
- Push notifications
- Install prompt

### Optimistic UI

- Optimistic updates for movie status changes
- Rollback on error

## API

### Rate Limiting per User

Current: Global rate limits.

**Goal:** Per-user rate limiting to prevent abuse from single accounts.

### Request Validation

Current: Basic DTO validation.

**Goal:** Add more detailed validation messages for frontend display.

## Database

### Full-Text Search

Current: LIKE queries for movie search.

**Goal:** PostgreSQL full-text search with `tsvector` for better movie search.

```sql
ALTER TABLE movies ADD COLUMN search_vector tsvector;
CREATE INDEX movies_search_idx ON movies USING gin(search_vector);
```

### Soft Delete

Current: Hard delete for users/groups.

**Goal:** Soft delete with `deleted_at` column for data recovery.

## Infrastructure

### Caching

- Redis for session storage
- API response caching for movie searches

### Monitoring

- Structured logging (JSON)
- Metrics collection (Prometheus)
- Error tracking (Sentry)
