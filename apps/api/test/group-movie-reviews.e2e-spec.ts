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
  groupMovieReviews,
  groupMovieReviewReactions,
} from '../src/db/schemas';
import { createGroup, addGroupMember } from './helpers/groups.helper';
import { registerUserViaApi } from './helpers/auth.helper';
import { AppModule } from '../src/app.module';

describe('Group Movie Reviews E2E', () => {
  let app: NestFastifyApplication;
  let drizzleDb: ReturnType<typeof drizzle>;
  let sql: ReturnType<typeof postgres>;
  let seededMovie: { id: number; title: string };

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
    await drizzleDb.delete(groupMovieReviewReactions);
    await drizzleDb.delete(groupMovieReviews);
    await drizzleDb.delete(groupMovies);
    await drizzleDb.delete(groups);
    await drizzleDb.delete(movies);
    await drizzleDb.delete(users);

    const [movie] = await drizzleDb
      .insert(movies)
      .values({
        externalId: 'kp-review-test',
        imdbId: 'tt9999999',
        title: 'Review Test Movie',
        overview: 'A movie for review tests',
        releaseYear: 2024,
        runtime: 120,
      })
      .returning();
    seededMovie = movie;
  });

  describe('Review CRUD', () => {
    it('should create, update, and delete a review', async () => {
      const { accessToken, userId } = await registerUserViaApi(
        app,
        'reviewer@example.com',
      );
      const group = await createGroup(app, accessToken, 'Review Group');

      const [groupMovie] = await drizzleDb
        .insert(groupMovies)
        .values({
          groupId: group.id,
          source: 'provider',
          movieId: seededMovie.id,
          title: seededMovie.title,
          addedBy: userId,
          status: 'watched',
          watchDate: new Date('2024-06-01'),
        })
        .returning();

      // Create review
      const createRes = await request(app.getHttpServer())
        .post(`/groups/${group.id}/movies/${groupMovie.id}/reviews`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ rating: 4.5, text: 'Great movie!' })
        .expect(201);

      expect(createRes.body.rating).toBe(4.5);
      expect(createRes.body.text).toBe('Great movie!');
      expect(createRes.body.isOwn).toBe(true);
      expect(createRes.body.reactions).toEqual([]);
      const reviewId = createRes.body.id;

      // Update review
      const updateRes = await request(app.getHttpServer())
        .patch(
          `/groups/${group.id}/movies/${groupMovie.id}/reviews/${reviewId}`,
        )
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ rating: 5.0, text: 'Amazing!' })
        .expect(200);

      expect(updateRes.body.rating).toBe(5);
      expect(updateRes.body.text).toBe('Amazing!');

      // Get movie details with review
      const getRes = await request(app.getHttpServer())
        .get(`/groups/${group.id}/movies/${groupMovie.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(getRes.body.reviews).toHaveLength(1);
      expect(getRes.body.reviews[0].rating).toBe(5);
      expect(getRes.body.reviews[0].reactions).toEqual([]);

      // Delete review
      await request(app.getHttpServer())
        .delete(
          `/groups/${group.id}/movies/${groupMovie.id}/reviews/${reviewId}`,
        )
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      const afterDeleteRes = await request(app.getHttpServer())
        .get(`/groups/${group.id}/movies/${groupMovie.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(afterDeleteRes.body.reviews).toHaveLength(0);
    });

    it('should reject review for unwatched movie', async () => {
      const { accessToken, userId } = await registerUserViaApi(
        app,
        'unwatched@example.com',
      );
      const group = await createGroup(app, accessToken, 'Unwatched Group');

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
        .post(`/groups/${group.id}/movies/${groupMovie.id}/reviews`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ rating: 4.0 })
        .expect(422);
    });

    it('should reject duplicate review', async () => {
      const { accessToken, userId } = await registerUserViaApi(
        app,
        'dupreview@example.com',
      );
      const group = await createGroup(app, accessToken, 'Dup Review Group');

      const [groupMovie] = await drizzleDb
        .insert(groupMovies)
        .values({
          groupId: group.id,
          source: 'provider',
          movieId: seededMovie.id,
          title: seededMovie.title,
          addedBy: userId,
          status: 'watched',
          watchDate: new Date('2024-06-01'),
        })
        .returning();

      await request(app.getHttpServer())
        .post(`/groups/${group.id}/movies/${groupMovie.id}/reviews`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ rating: 4.0 })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/groups/${group.id}/movies/${groupMovie.id}/reviews`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ rating: 3.0 })
        .expect(409);
    });
  });

  describe('Reactions', () => {
    it('should add and remove a reaction', async () => {
      const { accessToken, userId } = await registerUserViaApi(
        app,
        'reactor@example.com',
      );
      const group = await createGroup(app, accessToken, 'Reaction Group');

      const [groupMovie] = await drizzleDb
        .insert(groupMovies)
        .values({
          groupId: group.id,
          source: 'provider',
          movieId: seededMovie.id,
          title: seededMovie.title,
          addedBy: userId,
          status: 'watched',
          watchDate: new Date('2024-06-01'),
        })
        .returning();

      const [review] = await drizzleDb
        .insert(groupMovieReviews)
        .values({
          groupMovieId: groupMovie.id,
          userId,
          rating: '4.5',
          text: 'Good movie',
        })
        .returning();

      // Create another user to react
      const { accessToken: otherToken, userId: otherUserId } =
        await registerUserViaApi(app, 'other@example.com');
      await addGroupMember(app, accessToken, group.id, otherUserId);

      // Add reaction
      const reactRes = await request(app.getHttpServer())
        .post(
          `/groups/${group.id}/movies/${groupMovie.id}/reviews/${review.id}/reactions`,
        )
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ emoji: '👍' })
        .expect(201);

      expect(reactRes.body.emoji).toBe('👍');
      expect(reactRes.body.isOwn).toBe(true);

      // Check reaction appears in movie details
      const getRes = await request(app.getHttpServer())
        .get(`/groups/${group.id}/movies/${groupMovie.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(200);

      expect(getRes.body.reviews[0].reactions).toHaveLength(1);
      expect(getRes.body.reviews[0].reactions[0].emoji).toBe('👍');
      expect(getRes.body.reviews[0].reactions[0].count).toBeUndefined();
      expect(getRes.body.reviews[0].reactions[0].isOwn).toBe(true);

      // Remove reaction
      await request(app.getHttpServer())
        .delete(
          `/groups/${group.id}/movies/${groupMovie.id}/reviews/${review.id}/reactions`,
        )
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(204);

      const afterRemoveRes = await request(app.getHttpServer())
        .get(`/groups/${group.id}/movies/${groupMovie.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(200);

      expect(afterRemoveRes.body.reviews[0].reactions).toHaveLength(0);
    });

    it('should reject reaction on own review', async () => {
      const { accessToken, userId } = await registerUserViaApi(
        app,
        'ownreact@example.com',
      );
      const group = await createGroup(app, accessToken, 'Own React Group');

      const [groupMovie] = await drizzleDb
        .insert(groupMovies)
        .values({
          groupId: group.id,
          source: 'provider',
          movieId: seededMovie.id,
          title: seededMovie.title,
          addedBy: userId,
          status: 'watched',
          watchDate: new Date('2024-06-01'),
        })
        .returning();

      const [review] = await drizzleDb
        .insert(groupMovieReviews)
        .values({
          groupMovieId: groupMovie.id,
          userId,
          rating: '4.5',
        })
        .returning();

      await request(app.getHttpServer())
        .post(
          `/groups/${group.id}/movies/${groupMovie.id}/reviews/${review.id}/reactions`,
        )
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ emoji: '👍' })
        .expect(403);
    });

    it('should reject duplicate reaction', async () => {
      const { accessToken, userId } = await registerUserViaApi(
        app,
        'dupreact@example.com',
      );
      const group = await createGroup(app, accessToken, 'Dup React Group');

      const [groupMovie] = await drizzleDb
        .insert(groupMovies)
        .values({
          groupId: group.id,
          source: 'provider',
          movieId: seededMovie.id,
          title: seededMovie.title,
          addedBy: userId,
          status: 'watched',
          watchDate: new Date('2024-06-01'),
        })
        .returning();

      const [review] = await drizzleDb
        .insert(groupMovieReviews)
        .values({
          groupMovieId: groupMovie.id,
          userId,
          rating: '4.5',
        })
        .returning();

      const { accessToken: otherToken, userId: otherUserId } =
        await registerUserViaApi(app, 'otherdup@example.com');
      await addGroupMember(app, accessToken, group.id, otherUserId);

      await request(app.getHttpServer())
        .post(
          `/groups/${group.id}/movies/${groupMovie.id}/reviews/${review.id}/reactions`,
        )
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ emoji: '👍' })
        .expect(201);

      await request(app.getHttpServer())
        .post(
          `/groups/${group.id}/movies/${groupMovie.id}/reviews/${review.id}/reactions`,
        )
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ emoji: '❤️' })
        .expect(409);
    });

    it('should return 404 when review belongs to another group movie', async () => {
      const { accessToken, userId } = await registerUserViaApi(
        app,
        'wronggm@example.com',
      );
      const group = await createGroup(app, accessToken, 'Wrong GM Group');

      const [movie2] = await drizzleDb
        .insert(movies)
        .values({
          externalId: 'kp-review-test-2',
          imdbId: 'tt9999998',
          title: 'Review Test Movie 2',
          overview: 'Another movie for review tests',
          releaseYear: 2024,
          runtime: 90,
        })
        .returning();

      const [groupMovie1] = await drizzleDb
        .insert(groupMovies)
        .values({
          groupId: group.id,
          source: 'provider',
          movieId: seededMovie.id,
          title: seededMovie.title,
          addedBy: userId,
          status: 'watched',
          watchDate: new Date('2024-06-01'),
        })
        .returning();

      const [groupMovie2] = await drizzleDb
        .insert(groupMovies)
        .values({
          groupId: group.id,
          source: 'provider',
          movieId: movie2.id,
          title: movie2.title,
          addedBy: userId,
          status: 'watched',
          watchDate: new Date('2024-06-01'),
        })
        .returning();

      const [review] = await drizzleDb
        .insert(groupMovieReviews)
        .values({
          groupMovieId: groupMovie1.id,
          userId,
          rating: '4.5',
        })
        .returning();

      const { accessToken: otherToken, userId: otherUserId } =
        await registerUserViaApi(app, 'otherwronggm@example.com');
      await addGroupMember(app, accessToken, group.id, otherUserId);

      // Try to add reaction using wrong groupMovieId
      await request(app.getHttpServer())
        .post(
          `/groups/${group.id}/movies/${groupMovie2.id}/reviews/${review.id}/reactions`,
        )
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ emoji: '👍' })
        .expect(404);

      // Try to remove reaction using wrong groupMovieId
      await request(app.getHttpServer())
        .delete(
          `/groups/${group.id}/movies/${groupMovie2.id}/reviews/${review.id}/reactions`,
        )
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);
    });

    it('should return 400 for invalid emoji', async () => {
      const { accessToken, userId } = await registerUserViaApi(
        app,
        'bademoji@example.com',
      );
      const group = await createGroup(app, accessToken, 'Bad Emoji Group');

      const [groupMovie] = await drizzleDb
        .insert(groupMovies)
        .values({
          groupId: group.id,
          source: 'provider',
          movieId: seededMovie.id,
          title: seededMovie.title,
          addedBy: userId,
          status: 'watched',
          watchDate: new Date('2024-06-01'),
        })
        .returning();

      const [review] = await drizzleDb
        .insert(groupMovieReviews)
        .values({
          groupMovieId: groupMovie.id,
          userId,
          rating: '4.5',
        })
        .returning();

      const { accessToken: otherToken, userId: otherUserId } =
        await registerUserViaApi(app, 'otherbademoji@example.com');
      await addGroupMember(app, accessToken, group.id, otherUserId);

      await request(app.getHttpServer())
        .post(
          `/groups/${group.id}/movies/${groupMovie.id}/reviews/${review.id}/reactions`,
        )
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ emoji: 'invalid' })
        .expect(400);
    });

    it('should return 404 when removing non-existent reaction', async () => {
      const { accessToken, userId } = await registerUserViaApi(
        app,
        'noreact@example.com',
      );
      const group = await createGroup(app, accessToken, 'No React Group');

      const [groupMovie] = await drizzleDb
        .insert(groupMovies)
        .values({
          groupId: group.id,
          source: 'provider',
          movieId: seededMovie.id,
          title: seededMovie.title,
          addedBy: userId,
          status: 'watched',
          watchDate: new Date('2024-06-01'),
        })
        .returning();

      const [review] = await drizzleDb
        .insert(groupMovieReviews)
        .values({
          groupMovieId: groupMovie.id,
          userId,
          rating: '4.5',
        })
        .returning();

      const { accessToken: otherToken, userId: otherUserId } =
        await registerUserViaApi(app, 'othernoreact@example.com');
      await addGroupMember(app, accessToken, group.id, otherUserId);

      await request(app.getHttpServer())
        .delete(
          `/groups/${group.id}/movies/${groupMovie.id}/reviews/${review.id}/reactions`,
        )
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);
    });
  });
});
