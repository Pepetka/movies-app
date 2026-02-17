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
import request from 'supertest';
import postgres from 'postgres';

import { users, groups, groupMembers, customMovies } from '../src/db/schemas';
import { registerUserViaApi, createGroup } from './helpers';
import { AppModule } from '../src/app.module';

describe('Custom Movies E2E', () => {
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
    await app?.close();
    await sql?.end();
  });

  beforeEach(async () => {
    await drizzleDb.delete(customMovies);
    await drizzleDb.delete(groupMembers);
    await drizzleDb.delete(groups);
    await drizzleDb.delete(users);
  });

  describe('CRUD', () => {
    it('should create, read, update and delete custom movie', async () => {
      const { accessToken } = await registerUserViaApi(app, 'user@example.com');
      const group = await createGroup(app, accessToken, 'Test Group');

      // Create
      const createRes = await request(app.getHttpServer())
        .post(`/groups/${group.id}/custom-movies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'My Movie',
          status: 'watched',
          watchedDate: '2024-12-25T20:00:00Z',
        })
        .expect(201);

      expect(createRes.body.title).toBe('My Movie');
      expect(createRes.body.status).toBe('watched');
      const movieId = createRes.body.id;

      // Read list
      const listRes = await request(app.getHttpServer())
        .get(`/groups/${group.id}/custom-movies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(listRes.body).toHaveLength(1);

      // Read one
      const getRes = await request(app.getHttpServer())
        .get(`/groups/${group.id}/custom-movies/${movieId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(getRes.body.title).toBe('My Movie');

      // Update
      const updateRes = await request(app.getHttpServer())
        .patch(`/groups/${group.id}/custom-movies/${movieId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Updated Movie' })
        .expect(200);

      expect(updateRes.body.title).toBe('Updated Movie');

      // Delete
      await request(app.getHttpServer())
        .delete(`/groups/${group.id}/custom-movies/${movieId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/groups/${group.id}/custom-movies/${movieId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('Error handling', () => {
    it('should return 404 for non-existent movie', async () => {
      const { accessToken } = await registerUserViaApi(
        app,
        'user2@example.com',
      );
      const group = await createGroup(app, accessToken, 'Empty Group');

      await request(app.getHttpServer())
        .get(`/groups/${group.id}/custom-movies/99999`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should return 404 when updating non-existent movie', async () => {
      const { accessToken } = await registerUserViaApi(
        app,
        'user3@example.com',
      );
      const group = await createGroup(app, accessToken, 'No Movie');

      await request(app.getHttpServer())
        .patch(`/groups/${group.id}/custom-movies/99999`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Test' })
        .expect(404);
    });
  });
});
