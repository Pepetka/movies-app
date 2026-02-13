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

import {
  users,
  groups,
  movies,
  groupMovies,
  customMovies,
} from '../src/db/schemas';
import { registerUserViaApi, createGroup } from './helpers';
import { KinopoiskService } from '../src/movies/providers';
import { AppModule } from '../src/app.module';

const mockKinopoiskService = {
  name: 'kinopoisk',
  search: jest.fn().mockResolvedValue({
    page: 1,
    totalPages: 1,
    totalResults: 1,
    results: [
      {
        externalId: 'kp-mock-1',
        imdbId: 'tt0133093',
        title: 'The Matrix',
        posterPath: 'https://example.com/poster.jpg',
        overview: 'A computer hacker learns about the true nature of reality.',
        releaseYear: 1999,
        rating: 8.7,
      },
    ],
  }),
  getMovieDetails: jest.fn(),
  findByImdbId: jest.fn(),
  mapToNewMovie: jest.fn(),
  getPosterUrl: jest.fn((path) => path),
};

describe('Group Movies E2E', () => {
  let app: NestFastifyApplication;
  let drizzleDb: ReturnType<typeof drizzle>;
  let sql: ReturnType<typeof postgres>;
  let seededMovie: { id: number };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(KinopoiskService)
      .useValue(mockKinopoiskService)
      .compile();

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

    // @ts-expect-error Fastify plugin types are incompatible
    await app.register(cookie, { secret });
    // @ts-expect-error Fastify plugin types are incompatible
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
    await drizzleDb.delete(groupMovies);
    await drizzleDb.delete(groups);
    await drizzleDb.delete(movies);
    await drizzleDb.delete(users);

    const [movie] = await drizzleDb
      .insert(movies)
      .values({
        externalId: 'kp-test-123',
        imdbId: 'tt1234567',
        title: 'Test Movie',
        overview: 'A test movie',
        releaseYear: 2024,
        runtime: 120,
      })
      .returning();
    seededMovie = movie;
  });

  describe('CRUD operations', () => {
    it('should add, list, update and remove movie from group', async () => {
      const { accessToken } = await registerUserViaApi(app, 'user@example.com');
      const group = await createGroup(app, accessToken, 'Test Group');

      // Add movie
      const addRes = await request(app.getHttpServer())
        .post(`/groups/${group.id}/movies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ externalId: 'kp-test-123' })
        .expect(201);

      expect(addRes.body.movieId).toBe(seededMovie.id);
      expect(addRes.body.status).toBe('tracking');

      // List movies
      const listRes = await request(app.getHttpServer())
        .get(`/groups/${group.id}/movies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(listRes.body).toHaveLength(1);

      // Get single movie
      const getRes = await request(app.getHttpServer())
        .get(`/groups/${group.id}/movies/${seededMovie.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(getRes.body.movieId).toBe(seededMovie.id);

      // Update status
      const updateRes = await request(app.getHttpServer())
        .patch(`/groups/${group.id}/movies/${seededMovie.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'watched', watchedDate: '2024-12-25T20:00:00Z' })
        .expect(200);

      expect(updateRes.body.status).toBe('watched');

      // Remove movie
      await request(app.getHttpServer())
        .delete(`/groups/${group.id}/movies/${seededMovie.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/groups/${group.id}/movies/${seededMovie.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should reject duplicate movie', async () => {
      const { accessToken, userId } = await registerUserViaApi(
        app,
        'dup@example.com',
      );
      const group = await createGroup(app, accessToken, 'Dup Group');

      await drizzleDb.insert(groupMovies).values({
        groupId: group.id,
        movieId: seededMovie.id,
        addedBy: userId,
        status: 'tracking',
      });

      await request(app.getHttpServer())
        .post(`/groups/${group.id}/movies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ externalId: 'kp-test-123' })
        .expect(409);
    });
  });

  describe('Convert to custom movie', () => {
    it('should convert group movie to custom', async () => {
      const { accessToken, userId } = await registerUserViaApi(
        app,
        'convert@example.com',
      );
      const group = await createGroup(app, accessToken, 'Convert Group');

      await drizzleDb.insert(groupMovies).values({
        groupId: group.id,
        movieId: seededMovie.id,
        addedBy: userId,
        status: 'tracking',
      });

      const res = await request(app.getHttpServer())
        .patch(`/groups/${group.id}/movies/${seededMovie.id}/edit`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Custom Title' })
        .expect(200);

      expect(res.body.title).toBe('Custom Title');

      // Group movie removed
      await request(app.getHttpServer())
        .get(`/groups/${group.id}/movies/${seededMovie.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('Error handling', () => {
    it('should return 404 for non-existent movie in group', async () => {
      const { accessToken } = await registerUserViaApi(
        app,
        'error@example.com',
      );
      const group = await createGroup(app, accessToken, 'Empty Group');

      await request(app.getHttpServer())
        .get(`/groups/${group.id}/movies/${seededMovie.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('Search', () => {
    it('should search movies in group context', async () => {
      const { accessToken } = await registerUserViaApi(
        app,
        'search@example.com',
      );
      const group = await createGroup(app, accessToken, 'Search Group');

      const res = await request(app.getHttpServer())
        .get(`/groups/${group.id}/movies/search`)
        .query({ query: 'matrix' })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('provider');
      expect(res.body).toHaveProperty('currentGroup');
    });
  });
});
