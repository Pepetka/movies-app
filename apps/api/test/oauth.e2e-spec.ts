import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { drizzle } from 'drizzle-orm/postgres-js';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import csrf from '@fastify/csrf-protection';
import cookie from '@fastify/cookie';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import postgres from 'postgres';

import { users, oauthAccounts, groups, groupMembers } from '$db/schemas';
import { UserRole } from '$common/enums';

import { AppModule } from '../src/app.module';

// ============================================================
// Mock Google OIDC API
// ============================================================

const MOCK_GOOGLE_PROFILE = {
  sub: 'google-user-123',
  email: 'oauth-test@example.com',
  email_verified: true,
  name: 'OAuth Test User',
  picture: 'https://example.com/avatar.jpg',
};

interface MockOptions {
  emailVerified?: boolean;
  tokenStatus?: number;
  userinfoStatus?: number;
}

function mockGoogleOAuthApis(options: MockOptions = {}) {
  const {
    emailVerified = true,
    tokenStatus = 200,
    userinfoStatus = 200,
  } = options;

  const originalFetch = global.fetch;
  global.fetch = jest.fn(
    async (url: string | URL | Request, init?: RequestInit) => {
      const urlString = url.toString();

      if (urlString.includes('oauth2.googleapis.com/token')) {
        if (tokenStatus !== 200) {
          return {
            ok: false,
            status: tokenStatus,
            json: async () => ({}),
          } as Response;
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({
            access_token: 'mock-google-access-token',
            token_type: 'Bearer',
            expires_in: 3600,
          }),
        } as Response;
      }

      if (urlString.includes('openidconnect.googleapis.com/v1/userinfo')) {
        if (userinfoStatus !== 200) {
          return {
            ok: false,
            status: userinfoStatus,
            json: async () => ({}),
          } as Response;
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({
            ...MOCK_GOOGLE_PROFILE,
            email_verified: emailVerified,
          }),
        } as Response;
      }

      return originalFetch(url, init);
    },
  ) as typeof global.fetch;

  return () => {
    global.fetch = originalFetch;
  };
}

// ============================================================
// Helpers
// ============================================================

function extractCookieValue(
  cookies: string | string[] | undefined,
  name: string,
): string | undefined {
  if (!cookies) return undefined;
  const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
  const target = cookieArray.find((c) => c.startsWith(`${name}=`));
  if (!target) return undefined;
  const match = target.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : undefined;
}

function parseStateFromUrl(url: string): string | null {
  return new URL(url).searchParams.get('state');
}

async function performOAuthLogin(
  app: NestFastifyApplication,
  redirect?: string,
): Promise<request.Response> {
  const redirectResponse = await request(app.getHttpServer())
    .get('/auth/oauth/google')
    .query(redirect ? { redirect } : {})
    .expect(302);

  const sessionCookie = extractCookieValue(
    redirectResponse.headers['set-cookie'],
    'oauth_session',
  );
  expect(sessionCookie).toBeDefined();

  const stateParam = parseStateFromUrl(
    redirectResponse.headers.location as string,
  );
  expect(stateParam).toBeTruthy();

  return request(app.getHttpServer())
    .get('/auth/oauth/google/callback')
    .query({ code: 'mock-auth-code', state: stateParam })
    .set('Cookie', [`oauth_session=${sessionCookie}`])
    .redirects(0);
}

// ============================================================
// Tests
// ============================================================

describe('OAuth E2E', () => {
  let app: NestFastifyApplication;
  let drizzleDb: ReturnType<typeof drizzle>;
  let sql: ReturnType<typeof postgres>;
  let restoreFetch: () => void;

  beforeAll(async () => {
    restoreFetch = mockGoogleOAuthApis({ emailVerified: true });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    const configService = app.get<ConfigService>(ConfigService);
    const databaseUrl = configService.getOrThrow<string>('DATABASE_URL');

    sql = postgres(databaseUrl);
    drizzleDb = drizzle(sql, { casing: 'snake_case' });

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    const secret = configService.getOrThrow<string>('COOKIE_SECRET');
    await app.register(cookie, { secret });
    await app.register(csrf, {
      cookieOpts: {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/',
      },
    });

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    restoreFetch?.();
    await app?.close();
    await sql?.end();
  });

  beforeEach(async () => {
    restoreFetch?.();
    restoreFetch = mockGoogleOAuthApis({ emailVerified: true });

    await drizzleDb.delete(groupMembers);
    await drizzleDb.delete(groups);
    await drizzleDb.delete(oauthAccounts);
    await drizzleDb.delete(users);
  });

  // ============================================================
  describe('CSRF Token', () => {
    it('should return a CSRF token and set _csrf cookie', async () => {
      const response = await request(app.getHttpServer())
        .get('/csrf/token')
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.length).toBeGreaterThan(0);

      const csrfCookie = extractCookieValue(
        response.headers['set-cookie'],
        '_csrf',
      );
      expect(csrfCookie).toBeDefined();
    });
  });

  // ============================================================
  describe('OAuth Redirect (init)', () => {
    it('should redirect to Google with state, code_challenge, openid scope', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/oauth/google')
        .expect(302);

      const location = response.headers.location as string;
      expect(location).toContain('accounts.google.com');
      expect(location).toContain('client_id=');
      expect(location).toContain('state=');
      expect(location).toContain('code_challenge=');
      expect(location).toContain('code_challenge_method=S256');
      expect(decodeURIComponent(location).replace(/\+/g, ' ')).toContain(
        'scope=openid email profile',
      );

      const sessionCookie = extractCookieValue(
        response.headers['set-cookie'],
        'oauth_session',
      );
      expect(sessionCookie).toBeDefined();
      expect(sessionCookie!.length).toBeGreaterThan(20);
    });

    it('should reject unsupported provider with 400', async () => {
      await request(app.getHttpServer()).get('/auth/oauth/unknown').expect(400);
    });

    it('should store redirect in oauth_session cookie when provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/oauth/google')
        .query({ redirect: '/invite/test-token' })
        .expect(302);

      const sessionCookie = extractCookieValue(
        response.headers['set-cookie'],
        'oauth_session',
      );
      expect(sessionCookie).toBeDefined();
    });
  });

  // ============================================================
  describe('OAuth Callback — login flow', () => {
    it('should authenticate new user, create users + oauth_accounts, redirect to /oauth/success', async () => {
      const callbackResponse = await performOAuthLogin(app);

      expect(callbackResponse.status).toBe(302);
      expect(callbackResponse.headers.location).toContain('/oauth/success');

      const refreshToken = extractCookieValue(
        callbackResponse.headers['set-cookie'],
        'refresh_token',
      );
      expect(refreshToken).toBeDefined();

      const dbUsers = await drizzleDb.select().from(users);
      expect(dbUsers).toHaveLength(1);
      expect(dbUsers[0].email).toBe('oauth-test@example.com');
      expect(dbUsers[0].passwordHash).toBeNull();
      expect(dbUsers[0].avatar).toBe('https://example.com/avatar.jpg');

      const dbOAuth = await drizzleDb.select().from(oauthAccounts);
      expect(dbOAuth).toHaveLength(1);
      expect(dbOAuth[0].provider).toBe('google');
      expect(dbOAuth[0].providerAccountId).toBe('google-user-123');
      expect(dbOAuth[0].userId).toBe(dbUsers[0].id);
    });

    it('should authenticate existing OAuth user without creating duplicate oauth_accounts', async () => {
      const [user] = await drizzleDb
        .insert(users)
        .values({
          name: 'OAuth Test User',
          email: 'oauth-test@example.com',
          passwordHash: null,
          role: UserRole.USER,
        })
        .returning();

      await drizzleDb.insert(oauthAccounts).values({
        userId: user.id,
        provider: 'google',
        providerAccountId: 'google-user-123',
      });

      const callbackResponse = await performOAuthLogin(app);
      expect(callbackResponse.status).toBe(302);
      expect(callbackResponse.headers.location).toContain('/oauth/success');

      const dbUsers = await drizzleDb.select().from(users);
      expect(dbUsers).toHaveLength(1);

      const dbOAuth = await drizzleDb.select().from(oauthAccounts);
      expect(dbOAuth).toHaveLength(1);
    });

    it('should auto-link OAuth to existing local user with same email', async () => {
      const [localUser] = await drizzleDb
        .insert(users)
        .values({
          name: 'Local User',
          email: 'oauth-test@example.com',
          passwordHash: bcrypt.hashSync('SecurePass123!', 12),
          role: UserRole.USER,
        })
        .returning();

      const callbackResponse = await performOAuthLogin(app);
      expect(callbackResponse.status).toBe(302);

      const dbUsers = await drizzleDb.select().from(users);
      expect(dbUsers).toHaveLength(1);
      expect(dbUsers[0].id).toBe(localUser.id);
      expect(dbUsers[0].passwordHash).toBeTruthy();

      const dbOAuth = await drizzleDb.select().from(oauthAccounts);
      expect(dbOAuth).toHaveLength(1);
      expect(dbOAuth[0].userId).toBe(localUser.id);
    });

    it('should redirect to /oauth/success with redirect query param when session has redirect', async () => {
      const callbackResponse = await performOAuthLogin(
        app,
        '/invite/test-token',
      );

      expect(callbackResponse.status).toBe(302);
      expect(callbackResponse.headers.location).toContain('/oauth/success');
      expect(callbackResponse.headers.location).toContain(
        'redirect=%2Finvite%2Ftest-token',
      );

      const refreshToken = extractCookieValue(
        callbackResponse.headers['set-cookie'],
        'refresh_token',
      );
      expect(refreshToken).toBeDefined();
    });

    it('should redirect to /oauth/error on invalid state (302)', async () => {
      const redirectResponse = await request(app.getHttpServer())
        .get('/auth/oauth/google')
        .expect(302);

      const sessionCookie = extractCookieValue(
        redirectResponse.headers['set-cookie'],
        'oauth_session',
      );

      const response = await request(app.getHttpServer())
        .get('/auth/oauth/google/callback')
        .query({ code: 'mock-auth-code', state: 'forged-state' })
        .set('Cookie', [`oauth_session=${sessionCookie}`])
        .redirects(0);

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('/oauth/error');
      expect(response.headers.location).toContain('reason=invalid_state');
    });

    it('should reject callback without oauth_session cookie (400)', async () => {
      await request(app.getHttpServer())
        .get('/auth/oauth/google/callback')
        .query({ code: 'mock-auth-code', state: 'whatever' })
        .expect(400);
    });

    it('should redirect to /oauth/error on access_denied', async () => {
      const redirectResponse = await request(app.getHttpServer())
        .get('/auth/oauth/google')
        .expect(302);

      const sessionCookie = extractCookieValue(
        redirectResponse.headers['set-cookie'],
        'oauth_session',
      );
      const stateParam = parseStateFromUrl(
        redirectResponse.headers.location as string,
      );

      const response = await request(app.getHttpServer())
        .get('/auth/oauth/google/callback')
        .query({ error: 'access_denied', state: stateParam })
        .set('Cookie', [`oauth_session=${sessionCookie}`])
        .redirects(0);

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('/oauth/error');
      expect(response.headers.location).toContain('reason=access_denied');
    });

    it('should redirect to /oauth/error on email_verified=false', async () => {
      restoreFetch();
      restoreFetch = mockGoogleOAuthApis({ emailVerified: false });

      const callbackResponse = await performOAuthLogin(app);
      expect(callbackResponse.status).toBe(302);
      expect(callbackResponse.headers.location).toContain('/oauth/error');
      expect(callbackResponse.headers.location).toContain(
        'reason=oauth_email_unverified',
      );

      const dbUsers = await drizzleDb.select().from(users);
      expect(dbUsers).toHaveLength(0);
    });

    it('should redirect to /oauth/error on token endpoint failure (PKCE/code mismatch)', async () => {
      restoreFetch();
      restoreFetch = mockGoogleOAuthApis({ tokenStatus: 400 });

      const callbackResponse = await performOAuthLogin(app);
      expect(callbackResponse.status).toBe(302);
      expect(callbackResponse.headers.location).toContain('/oauth/error');
      expect(callbackResponse.headers.location).toContain(
        'reason=oauth_code_exchange_failed',
      );
    });
  });

  // ============================================================
  describe('OAuth User — refresh and logout', () => {
    async function loginAndExtract() {
      const callbackResponse = await performOAuthLogin(app);
      const refreshToken = extractCookieValue(
        callbackResponse.headers['set-cookie'],
        'refresh_token',
      );
      const refreshResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refresh_token=${refreshToken}`])
        .expect(200);
      return {
        accessToken: refreshResponse.body.accessToken as string,
        refreshToken: extractCookieValue(
          refreshResponse.headers['set-cookie'],
          'refresh_token',
        ) as string,
      };
    }

    it('should refresh tokens for OAuth user', async () => {
      const { accessToken } = await loginAndExtract();
      expect(accessToken).toBeTruthy();
    });

    it('should logout OAuth user and invalidate refresh', async () => {
      const { accessToken, refreshToken } = await loginAndExtract();

      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refresh_token=${refreshToken}`])
        .expect(401);
    });
  });

  // ============================================================
  describe('OAuth-only user vs Local Auth', () => {
    it('should reject /login with password for OAuth-only user', async () => {
      const [user] = await drizzleDb
        .insert(users)
        .values({
          name: 'OAuth Test User',
          email: 'oauth-test@example.com',
          passwordHash: null,
          role: UserRole.USER,
        })
        .returning();

      await drizzleDb.insert(oauthAccounts).values({
        userId: user.id,
        provider: 'google',
        providerAccountId: 'google-user-123',
      });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'oauth-test@example.com',
          password: 'AnyPassword123!',
        })
        .expect(401);
    });
  });

  // ============================================================
  describe('Account Linking', () => {
    async function registerLocal(email: string) {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Local', email, password: 'SecurePass123!' })
        .expect(201);
      return response.body.accessToken as string;
    }

    it('should link OAuth provider to existing local user when emails match', async () => {
      const accessToken = await registerLocal('oauth-test@example.com');

      const initResponse = await request(app.getHttpServer())
        .post('/auth/oauth/google/link/init')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const sessionCookie = extractCookieValue(
        initResponse.headers['set-cookie'],
        'oauth_session',
      );
      const authUrl = initResponse.body.authUrl as string;
      const stateParam = parseStateFromUrl(authUrl);

      const callbackResponse = await request(app.getHttpServer())
        .get('/auth/oauth/google/callback')
        .query({ code: 'mock-auth-code', state: stateParam })
        .set('Cookie', [`oauth_session=${sessionCookie}`])
        .redirects(0);

      expect(callbackResponse.status).toBe(302);
      expect(callbackResponse.headers.location).toContain(
        '/oauth/link-success',
      );

      const dbOAuth = await drizzleDb.select().from(oauthAccounts);
      expect(dbOAuth).toHaveLength(1);
      expect(dbOAuth[0].provider).toBe('google');

      const dbUsers = await drizzleDb.select().from(users);
      expect(dbUsers).toHaveLength(1);
      expect(dbOAuth[0].userId).toBe(dbUsers[0].id);
    });

    it('should reject link if OAuth profile email differs from user email', async () => {
      const accessToken = await registerLocal('different@example.com');

      const initResponse = await request(app.getHttpServer())
        .post('/auth/oauth/google/link/init')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const sessionCookie = extractCookieValue(
        initResponse.headers['set-cookie'],
        'oauth_session',
      );
      const stateParam = parseStateFromUrl(initResponse.body.authUrl as string);

      const callbackResponse = await request(app.getHttpServer())
        .get('/auth/oauth/google/callback')
        .query({ code: 'mock-auth-code', state: stateParam })
        .set('Cookie', [`oauth_session=${sessionCookie}`])
        .redirects(0);

      expect(callbackResponse.status).toBe(302);
      expect(callbackResponse.headers.location).toContain('/oauth/error');
      expect(callbackResponse.headers.location).toContain(
        'reason=oauth_link_email_mismatch',
      );

      const dbOAuth = await drizzleDb.select().from(oauthAccounts);
      expect(dbOAuth).toHaveLength(0);
    });

    it('should be idempotent for repeated linking of same provider account', async () => {
      const accessToken = await registerLocal('oauth-test@example.com');

      const init1 = await request(app.getHttpServer())
        .post('/auth/oauth/google/link/init')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      await request(app.getHttpServer())
        .get('/auth/oauth/google/callback')
        .query({
          code: 'mock-auth-code',
          state: parseStateFromUrl(init1.body.authUrl as string),
        })
        .set('Cookie', [
          `oauth_session=${extractCookieValue(init1.headers['set-cookie'], 'oauth_session')}`,
        ])
        .redirects(0);

      const init2 = await request(app.getHttpServer())
        .post('/auth/oauth/google/link/init')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      const callbackResponse = await request(app.getHttpServer())
        .get('/auth/oauth/google/callback')
        .query({
          code: 'mock-auth-code',
          state: parseStateFromUrl(init2.body.authUrl as string),
        })
        .set('Cookie', [
          `oauth_session=${extractCookieValue(init2.headers['set-cookie'], 'oauth_session')}`,
        ])
        .redirects(0);

      expect(callbackResponse.status).toBe(302);
      expect(callbackResponse.headers.location).toContain(
        '/oauth/link-success',
      );

      const dbOAuth = await drizzleDb.select().from(oauthAccounts);
      expect(dbOAuth).toHaveLength(1);
    });

    it('should require auth for /link/init', async () => {
      await request(app.getHttpServer())
        .post('/auth/oauth/google/link/init')
        .expect(401);
    });
  });
});
