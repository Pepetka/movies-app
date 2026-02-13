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

import { users, groups, groupMembers } from '$db/schemas';
import { UserRole } from '$common/enums';

import { AppModule } from '../src/app.module';

describe('User E2E', () => {
  let app: NestFastifyApplication;
  let drizzleDb: ReturnType<typeof drizzle>;
  let sql: ReturnType<typeof postgres>;

  async function registerUser(
    email: string,
    role: UserRole = UserRole.USER,
  ): Promise<{ accessToken: string; userId: number }> {
    const hashedPassword = await bcrypt.hash('SecurePass123!', 12);

    const [user] = await drizzleDb
      .insert(users)
      .values({
        name: 'Test User',
        email,
        passwordHash: hashedPassword,
        role,
      })
      .returning();

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password: 'SecurePass123!',
      })
      .expect(200);

    return {
      accessToken: response.body.accessToken,
      userId: user.id,
    };
  }

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

  describe('Admin Operations', () => {
    it('should create user as admin', async () => {
      const { accessToken: adminToken } = await registerUser(
        'admin@example.com',
        UserRole.ADMIN,
      );

      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'SecurePass123!',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', 'newuser@example.com');
    });

    it('should list all users as admin', async () => {
      const { accessToken: adminToken } = await registerUser(
        'admin2@example.com',
        UserRole.ADMIN,
      );

      await registerUser('user1@example.com');
      await registerUser('user2@example.com');

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(3);
    });

    it('should deny user creation by non-admin', async () => {
      const { accessToken: userToken } =
        await registerUser('user3@example.com');

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'New User',
          email: 'newuser2@example.com',
          password: 'SecurePass123!',
        })
        .expect(403);
    });

    it('should deny user list access by non-admin', async () => {
      const { accessToken: userToken } =
        await registerUser('user4@example.com');

      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('GET /users/:id - Access Control', () => {
    it('should allow user to get own profile', async () => {
      const { accessToken, userId } = await registerUser('user5@example.com');

      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', userId);
      expect(response.body).toHaveProperty('email', 'user5@example.com');
    });

    it('should allow admin to get any profile', async () => {
      const { userId: targetUserId } = await registerUser('target@example.com');
      const { accessToken: adminToken } = await registerUser(
        'admin3@example.com',
        UserRole.ADMIN,
      );

      await request(app.getHttpServer())
        .get(`/users/${targetUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should deny user getting other profile', async () => {
      const { accessToken } = await registerUser('user6@example.com');

      await request(app.getHttpServer())
        .get('/users/999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent user', async () => {
      const { accessToken: adminToken } = await registerUser(
        'admin4@example.com',
        UserRole.ADMIN,
      );

      await request(app.getHttpServer())
        .get('/users/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('PATCH /users/:id - Access Control', () => {
    it('should allow user to update own profile', async () => {
      const { accessToken, userId } = await registerUser('user7@example.com');

      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Updated Name');
    });

    it('should allow user to update password', async () => {
      const { accessToken, userId } = await registerUser('user8@example.com');

      await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ password: 'NewSecurePass123!' })
        .expect(200);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'user8@example.com',
          password: 'NewSecurePass123!',
        })
        .expect(200);
    });

    it('should allow admin to update any user', async () => {
      const { userId: targetUserId } = await registerUser(
        'target2@example.com',
      );
      const { accessToken: adminToken } = await registerUser(
        'admin5@example.com',
        UserRole.ADMIN,
      );

      await request(app.getHttpServer())
        .patch(`/users/${targetUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Admin Updated' })
        .expect(200);
    });

    it('should deny user updating other profile', async () => {
      const { accessToken } = await registerUser('user9@example.com');

      await request(app.getHttpServer())
        .patch('/users/999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Should Fail' })
        .expect(403);
    });

    it('should reject duplicate email on update', async () => {
      const { accessToken, userId } = await registerUser('user10@example.com');
      await registerUser('existing@example.com');

      await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ email: 'existing@example.com' })
        .expect(409);
    });
  });

  describe('DELETE /users/:id - Access Control', () => {
    it('should allow user to delete own profile', async () => {
      const { accessToken, userId } = await registerUser('user11@example.com');

      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });

    it('should allow admin to delete any user', async () => {
      const { userId: targetUserId } = await registerUser(
        'target3@example.com',
      );
      const { accessToken: adminToken } = await registerUser(
        'admin6@example.com',
        UserRole.ADMIN,
      );

      await request(app.getHttpServer())
        .delete(`/users/${targetUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });

    it('should deny user deleting other profile', async () => {
      const { accessToken } = await registerUser('user12@example.com');

      await request(app.getHttpServer())
        .delete('/users/999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent user', async () => {
      const { accessToken: adminToken } = await registerUser(
        'admin7@example.com',
        UserRole.ADMIN,
      );

      await request(app.getHttpServer())
        .delete('/users/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('Pagination', () => {
    const createUsers = async (adminToken: string, count: number) => {
      for (let i = 0; i < count; i++) {
        await request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: `User ${i}`,
            email: `pagination${Date.now()}-${i}@example.com`,
            password: 'SecurePass123!',
          });
      }
    };

    it('should use default page size', async () => {
      const { accessToken: adminToken } = await registerUser(
        'admin-pagination1@example.com',
        UserRole.ADMIN,
      );
      await createUsers(adminToken, 25);

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.length).toBeLessThanOrEqual(20);
    }, 60000);

    it('should return second page correctly', async () => {
      const { accessToken: adminToken } = await registerUser(
        'admin-pagination2@example.com',
        UserRole.ADMIN,
      );
      await createUsers(adminToken, 10);

      const response = await request(app.getHttpServer())
        .get('/users?page=2&limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.length).toBeLessThanOrEqual(5);
    }, 45000);

    it('should respect custom limit', async () => {
      const { accessToken: adminToken } = await registerUser(
        'admin-pagination3@example.com',
        UserRole.ADMIN,
      );
      await createUsers(adminToken, 10);

      const response = await request(app.getHttpServer())
        .get('/users?limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.length).toBeLessThanOrEqual(5);
    }, 45000);
  });

  describe('Full Flow', () => {
    it('should complete full cycle: create → read → update → delete', async () => {
      const { accessToken: adminToken } = await registerUser(
        'admin12@example.com',
        UserRole.ADMIN,
      );

      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Flow User',
          email: 'flow@example.com',
          password: 'SecurePass123!',
        })
        .expect(201);

      const userId = createResponse.body.id;

      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Flow User' })
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
