import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { drizzle } from 'drizzle-orm/postgres-js';
import { ConfigService } from '@nestjs/config';
import type { FastifyInstance } from 'fastify';
import csrf from '@fastify/csrf-protection';
import cookie from '@fastify/cookie';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import postgres from 'postgres';

import { users, groups, groupMembers } from '$db/schemas';
import { UserRole } from '$common/enums';

import { AppModule } from '../src/app.module';

function extractRefreshToken(cookies: string | string[] | undefined): string {
  if (!cookies) return '';
  const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
  const refreshCookie = cookieArray.find((c) => c.includes('refresh_token='));
  if (!refreshCookie) return '';
  const match = refreshCookie.match(/refresh_token=([^;]+)/);
  return match ? match[1] : '';
}

function extractUserIdFromToken(accessToken: string): number {
  const payload = JSON.parse(
    Buffer.from(accessToken.split('.')[1], 'base64').toString(),
  );
  return payload.sub;
}

async function registerUser(
  app: INestApplication,
  email: string,
): Promise<{ accessToken: string; refreshToken: string; userId: number }> {
  const response = await request(
    app.getHttpServer() as FastifyInstance['server'],
  )
    .post('/auth/register')
    .send({
      name: 'Test User',
      email,
      password: 'SecurePass123!',
    })
    .expect(201);

  const accessToken = response.body.accessToken as string;
  const refreshToken = extractRefreshToken(response.headers['set-cookie']);
  const userId = extractUserIdFromToken(accessToken);

  return { accessToken, refreshToken, userId };
}

describe('Auth E2E', () => {
  let app: NestFastifyApplication;
  let drizzleDb: ReturnType<typeof drizzle>;
  let sql: ReturnType<typeof postgres>;

  beforeAll(async () => {
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

    // @ts-expect-error Fastify plugin types are incompatible with NestFastifyApplication.register()
    await app.register(cookie, { secret });
    // @ts-expect-error Fastify plugin types are incompatible with NestFastifyApplication.register()
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
    await app?.close();
    await sql?.end();
  });

  beforeEach(async () => {
    await drizzleDb.delete(groupMembers);
    await drizzleDb.delete(groups);
    await drizzleDb.delete(users);
  });

  describe('Registration', () => {
    it('should register a new user', async () => {
      const { accessToken, refreshToken } = await registerUser(
        app,
        'test1@example.com',
      );

      expect(accessToken).toBeTruthy();
      expect(refreshToken).toBeTruthy();
    });

    it('should reject duplicate registration', async () => {
      await registerUser(app, 'test2@example.com');

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test2@example.com',
          password: 'SecurePass123!',
        })
        .expect(409);
    });
  });

  describe('Login Flow', () => {
    const hashedPassword = bcrypt.hashSync('SecurePass123!', 12);

    beforeEach(async () => {
      await drizzleDb.insert(users).values({
        name: 'Test User',
        email: 'login-test@example.com',
        passwordHash: hashedPassword,
        role: UserRole.USER,
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'SecurePass123!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
    });

    it('should reject login with invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'notfound@example.com',
          password: 'SecurePass123!',
        })
        .expect(401);
    });

    it('should reject login with invalid password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'WrongPassword123!',
        })
        .expect(401);
    });
  });

  describe('Access Control', () => {
    it('should deny access to protected endpoint without token', async () => {
      await request(app.getHttpServer()).get('/users/1').expect(401);
    });

    it('should deny access with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/users/1')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should allow access with valid token to own user data', async () => {
      const { accessToken, userId } = await registerUser(
        app,
        'test3@example.com',
      );

      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', userId);
      expect(response.body).toHaveProperty('email', 'test3@example.com');
    });

    it('should deny access to other users data', async () => {
      const { accessToken } = await registerUser(app, 'test3b@example.com');

      await request(app.getHttpServer())
        .get('/users/999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });
  });

  describe('Refresh Tokens', () => {
    it('should refresh tokens', async () => {
      const { refreshToken } = await registerUser(app, 'test4@example.com');

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refresh_token=${refreshToken}`])
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
    });

    it.skip('should rotate refresh token on refresh', async () => {
      const { refreshToken: firstRefreshToken } = await registerUser(
        app,
        'test5@example.com',
      );

      const firstResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refresh_token=${firstRefreshToken}`])
        .expect(200);

      const secondRefreshToken = extractRefreshToken(
        firstResponse.headers['set-cookie'],
      );

      expect(secondRefreshToken).toBeDefined();
      expect(secondRefreshToken).not.toBe(firstRefreshToken);
    });

    it.skip('should invalidate old refresh token after rotation', async () => {
      const { refreshToken: firstRefreshToken } = await registerUser(
        app,
        'test6@example.com',
      );

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refresh_token=${firstRefreshToken}`])
        .expect(200);

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refresh_token=${firstRefreshToken}`])
        .expect(401);
    });

    it('should reject refresh with invalid refresh token', async () => {
      await registerUser(app, 'test7@example.com');

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', ['refresh_token=invalid-refresh-token'])
        .expect(401);
    });
  });

  describe('Logout', () => {
    it('should logout user and clear refresh token', async () => {
      const { accessToken, refreshToken } = await registerUser(
        app,
        'test8@example.com',
      );

      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refresh_token=${refreshToken}`])
        .expect(401);
    });

    it('should deny logout without token', async () => {
      await request(app.getHttpServer()).post('/auth/logout').expect(401);
    });
  });

  describe('Full Auth Flow', () => {
    it('should complete full auth cycle: register → access protected → refresh → logout', async () => {
      const { accessToken, refreshToken, userId } = await registerUser(
        app,
        'test9@example.com',
      );

      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const refreshResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refresh_token=${refreshToken}`])
        .expect(200);

      const newAccessToken = refreshResponse.body.accessToken;

      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .expect(204);
    });
  });
});
