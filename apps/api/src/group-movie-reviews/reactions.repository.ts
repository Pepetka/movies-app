import { eq, and, inArray, getTableColumns } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';

import {
  groupMovieReviewReactions,
  users,
  type GroupMovieReviewReaction,
  type NewGroupMovieReviewReaction,
} from '$db/schemas';
import { DrizzleDb } from '$db/types/drizzle.types';
import { DRIZZLE } from '$db/db.module';

export interface ReviewReactionWithUser extends GroupMovieReviewReaction {
  userName: string;
  userAvatar: string | null;
}

@Injectable()
export class GroupMovieReviewReactionsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(
    data: NewGroupMovieReviewReaction,
  ): Promise<ReviewReactionWithUser | null> {
    return this.db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(groupMovieReviewReactions)
        .values(data)
        .returning();

      const [result] = await tx
        .select({
          ...getTableColumns(groupMovieReviewReactions),
          userName: users.name,
          userAvatar: users.avatar,
        })
        .from(groupMovieReviewReactions)
        .innerJoin(users, eq(groupMovieReviewReactions.userId, users.id))
        .where(eq(groupMovieReviewReactions.id, inserted.id))
        .limit(1);

      return result ?? null;
    });
  }

  async findByReviewIds(
    reviewIds: number[],
  ): Promise<ReviewReactionWithUser[]> {
    if (reviewIds.length === 0) return [];

    return this.db
      .select({
        ...getTableColumns(groupMovieReviewReactions),
        userName: users.name,
        userAvatar: users.avatar,
      })
      .from(groupMovieReviewReactions)
      .innerJoin(users, eq(groupMovieReviewReactions.userId, users.id))
      .where(inArray(groupMovieReviewReactions.reviewId, reviewIds))
      .orderBy(groupMovieReviewReactions.createdAt);
  }

  async findByReviewAndUser(
    reviewId: number,
    userId: number,
  ): Promise<ReviewReactionWithUser | null> {
    const [result] = await this.db
      .select({
        ...getTableColumns(groupMovieReviewReactions),
        userName: users.name,
        userAvatar: users.avatar,
      })
      .from(groupMovieReviewReactions)
      .innerJoin(users, eq(groupMovieReviewReactions.userId, users.id))
      .where(
        and(
          eq(groupMovieReviewReactions.reviewId, reviewId),
          eq(groupMovieReviewReactions.userId, userId),
        ),
      )
      .limit(1);
    return result ?? null;
  }

  async delete(id: number): Promise<void> {
    await this.db
      .delete(groupMovieReviewReactions)
      .where(eq(groupMovieReviewReactions.id, id));
  }
}
