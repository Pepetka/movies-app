import type { INestApplication } from '@nestjs/common';

import { groupMovies, groupMovieReviews } from '$db/schemas';

import { registerUserViaApi } from './auth.helper';
import { addGroupMember } from './groups.helper';

export async function seedGroupMovie(
  drizzleDb: any,
  groupId: number,
  movieId: number,
  userId: number,
  overrides?: {
    status?: 'tracking' | 'planned' | 'watched';
    watchDate?: Date;
    title?: string;
  },
) {
  const [groupMovie] = await drizzleDb
    .insert(groupMovies)
    .values({
      groupId,
      source: 'provider',
      movieId,
      title: overrides?.title ?? 'Test Movie',
      addedBy: userId,
      status: overrides?.status ?? 'watched',
      watchDate:
        overrides?.watchDate ??
        (overrides?.status === 'tracking' ? undefined : new Date('2024-06-01')),
    })
    .returning();
  return groupMovie as { id: number };
}

export async function seedReview(
  drizzleDb: any,
  groupMovieId: number,
  userId: number,
  overrides?: {
    rating?: string;
    text?: string;
  },
) {
  const [review] = await drizzleDb
    .insert(groupMovieReviews)
    .values({
      groupMovieId,
      userId,
      rating: overrides?.rating ?? '4.5',
      text: overrides?.text,
    })
    .returning();
  return review as { id: number };
}

export async function createOtherMember(
  app: INestApplication,
  groupId: number,
  accessToken: string,
  email?: string,
) {
  const { accessToken: otherToken, userId: otherUserId } =
    await registerUserViaApi(app, email ?? 'other@example.com');
  await addGroupMember(app, accessToken, groupId, otherUserId);
  return { accessToken: otherToken, userId: otherUserId };
}
