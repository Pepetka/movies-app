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

import { GroupMemberRole } from '$common/enums';

import { users, groups, movies, groupMovies } from '../src/db/schemas';
import { createGroup, addGroupMember } from './helpers/groups.helper';
import { registerUserViaApi } from './helpers/auth.helper';
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
  let seededMovie: { id: number; title: string };

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
      const groupMovieId = addRes.body.id;

      // List movies
      const listRes = await request(app.getHttpServer())
        .get(`/groups/${group.id}/movies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(listRes.body).toHaveLength(1);

      // Get single movie
      const getRes = await request(app.getHttpServer())
        .get(`/groups/${group.id}/movies/${groupMovieId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(getRes.body.movieId).toBe(seededMovie.id);

      // Update status
      const updateRes = await request(app.getHttpServer())
        .patch(`/groups/${group.id}/movies/${groupMovieId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'watched', watchDate: '2024-12-25T20:00:00Z' })
        .expect(200);

      expect(updateRes.body.status).toBe('watched');

      // Remove movie
      await request(app.getHttpServer())
        .delete(`/groups/${group.id}/movies/${groupMovieId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/groups/${group.id}/movies/${groupMovieId}`)
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
        source: 'provider',
        movieId: seededMovie.id,
        title: seededMovie.title,
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

  describe('Edit movie data', () => {
    it('should edit movie title and overview', async () => {
      const { accessToken, userId } = await registerUserViaApi(
        app,
        'edit@example.com',
      );
      const group = await createGroup(app, accessToken, 'Edit Group');

      const [groupMovie] = await drizzleDb
        .insert(groupMovies)
        .values({
          groupId: group.id,
          source: 'provider',
          movieId: seededMovie.id,
          title: seededMovie.title,
          addedBy: userId,
          status: 'tracking',
        })
        .returning();

      const res = await request(app.getHttpServer())
        .patch(`/groups/${group.id}/movies/${groupMovie.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Edited Title', overview: 'New overview' })
        .expect(200);

      expect(res.body.title).toBe('Edited Title');
      expect(res.body.overview).toBe('New overview');
    });
  });

  describe('Custom movies', () => {
    it('should create custom movie in group', async () => {
      const { accessToken } = await registerUserViaApi(
        app,
        'custom@example.com',
      );
      const group = await createGroup(app, accessToken, 'Custom Group');

      const res = await request(app.getHttpServer())
        .post(`/groups/${group.id}/movies/custom`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'My Custom Movie',
          overview: 'A custom movie description',
          releaseYear: 2024,
          runtime: 90,
          status: 'planned',
          watchDate: '2024-12-31T20:00:00Z',
        })
        .expect(201);

      expect(res.body.title).toBe('My Custom Movie');
      expect(res.body.source).toBe('custom');
      expect(res.body.movieId).toBeNull();
      expect(res.body.status).toBe('planned');
      expect(res.body.overview).toBe('A custom movie description');
      expect(res.body.releaseYear).toBe(2024);
      expect(res.body.runtime).toBe(90);
    });

    it('should list custom movies alongside provider movies', async () => {
      const { accessToken, userId } = await registerUserViaApi(
        app,
        'mixed@example.com',
      );
      const group = await createGroup(app, accessToken, 'Mixed Group');

      // Add provider movie
      await drizzleDb.insert(groupMovies).values({
        groupId: group.id,
        source: 'provider',
        movieId: seededMovie.id,
        title: seededMovie.title,
        addedBy: userId,
        status: 'tracking',
      });

      // Add custom movie
      await request(app.getHttpServer())
        .post(`/groups/${group.id}/movies/custom`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Custom Movie' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get(`/groups/${group.id}/movies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveLength(2);
      const sources = res.body.map((m: { source: string }) => m.source);
      expect(sources).toContain('provider');
      expect(sources).toContain('custom');
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
        .get(`/groups/${group.id}/movies/99999`)
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

  describe('Permissions - non-member access', () => {
    it('should deny access to list movies for non-member', async () => {
      const { accessToken: ownerToken } = await registerUserViaApi(
        app,
        'owner@example.com',
      );
      const { accessToken: nonMemberToken } = await registerUserViaApi(
        app,
        'nonmember@example.com',
      );
      const group = await createGroup(app, ownerToken, 'Private Group');

      await request(app.getHttpServer())
        .get(`/groups/${group.id}/movies`)
        .set('Authorization', `Bearer ${nonMemberToken}`)
        .expect(403);
    });

    it('should deny access to get single movie for non-member', async () => {
      const { accessToken: ownerToken, userId } = await registerUserViaApi(
        app,
        'owner2@example.com',
      );
      const { accessToken: nonMemberToken } = await registerUserViaApi(
        app,
        'nonmember2@example.com',
      );
      const group = await createGroup(app, ownerToken, 'Private Group 2');

      const [groupMovie] = await drizzleDb
        .insert(groupMovies)
        .values({
          groupId: group.id,
          source: 'provider',
          movieId: seededMovie.id,
          title: seededMovie.title,
          addedBy: userId,
          status: 'tracking',
        })
        .returning();

      await request(app.getHttpServer())
        .get(`/groups/${group.id}/movies/${groupMovie.id}`)
        .set('Authorization', `Bearer ${nonMemberToken}`)
        .expect(403);
    });

    it('should deny search for non-member', async () => {
      const { accessToken: ownerToken } = await registerUserViaApi(
        app,
        'owner3@example.com',
      );
      const { accessToken: nonMemberToken } = await registerUserViaApi(
        app,
        'nonmember3@example.com',
      );
      const group = await createGroup(app, ownerToken, 'Private Group 3');

      await request(app.getHttpServer())
        .get(`/groups/${group.id}/movies/search`)
        .query({ query: 'matrix' })
        .set('Authorization', `Bearer ${nonMemberToken}`)
        .expect(403);
    });
  });

  describe('Permissions - member vs moderator actions', () => {
    let ownerToken: string;
    let memberToken: string;
    let groupId: number;
    let groupMovieId: number;

    beforeEach(async () => {
      const { accessToken: ot, userId: oid } = await registerUserViaApi(
        app,
        'permowner@example.com',
      );
      const { accessToken: mt, userId: mid } = await registerUserViaApi(
        app,
        'permmember@example.com',
      );
      ownerToken = ot;
      memberToken = mt;

      const group = await createGroup(app, ownerToken, 'Perms Group');
      groupId = group.id;

      await addGroupMember(
        app,
        ownerToken,
        groupId,
        mid,
        GroupMemberRole.MEMBER,
      );

      const [groupMovie] = await drizzleDb
        .insert(groupMovies)
        .values({
          groupId,
          source: 'provider',
          movieId: seededMovie.id,
          title: seededMovie.title,
          addedBy: oid,
          status: 'tracking',
        })
        .returning();
      groupMovieId = groupMovie.id;
    });

    it('should deny adding movie for regular member', async () => {
      await request(app.getHttpServer())
        .post(`/groups/${groupId}/movies`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ externalId: 'kp-test-123' })
        .expect(403);
    });

    it('should deny creating custom movie for regular member', async () => {
      await request(app.getHttpServer())
        .post(`/groups/${groupId}/movies/custom`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ title: 'Member Movie' })
        .expect(403);
    });

    it('should deny updating movie for regular member', async () => {
      await request(app.getHttpServer())
        .patch(`/groups/${groupId}/movies/${groupMovieId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ status: 'watched' })
        .expect(403);
    });

    it('should deny removing movie for regular member', async () => {
      await request(app.getHttpServer())
        .delete(`/groups/${groupId}/movies/${groupMovieId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(403);
    });

    it('should allow listing movies for regular member', async () => {
      await request(app.getHttpServer())
        .get(`/groups/${groupId}/movies`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200);
    });

    it('should allow getting single movie for regular member', async () => {
      await request(app.getHttpServer())
        .get(`/groups/${groupId}/movies/${groupMovieId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200);
    });
  });

  describe('Permissions - moderator actions', () => {
    it('should allow moderator to add movie', async () => {
      const { accessToken: ownerToken } = await registerUserViaApi(
        app,
        'modowner@example.com',
      );
      const { accessToken: modToken, userId: modUserId } =
        await registerUserViaApi(app, 'actualmod@example.com');
      const group = await createGroup(app, ownerToken, 'Mod Group');

      await addGroupMember(
        app,
        ownerToken,
        group.id,
        modUserId,
        GroupMemberRole.MODERATOR,
      );

      await request(app.getHttpServer())
        .post(`/groups/${group.id}/movies/custom`)
        .set('Authorization', `Bearer ${modToken}`)
        .send({ title: 'Mod Added Movie' })
        .expect(201);
    });
  });
});
