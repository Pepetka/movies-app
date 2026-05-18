import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { eq, and, inArray, getTableColumns } from 'drizzle-orm';

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

  private _withUserColumns() {
    return {
      ...getTableColumns(groupMovieReviewReactions),
      userName: users.name,
      userAvatar: users.avatar,
    };
  }

  async create(
    data: NewGroupMovieReviewReaction,
  ): Promise<ReviewReactionWithUser> {
    return this.db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(groupMovieReviewReactions)
        .values(data)
        .returning();

      const [result] = await tx
        .select(this._withUserColumns())
        .from(groupMovieReviewReactions)
        .innerJoin(users, eq(groupMovieReviewReactions.userId, users.id))
        .where(eq(groupMovieReviewReactions.id, inserted.id))
        .limit(1);

      if (!result) {
        throw new InternalServerErrorException(
          'Failed to fetch reaction after mutation',
        );
      }

      return result;
    });
  }

  async findByReviewIds(
    reviewIds: number[],
  ): Promise<ReviewReactionWithUser[]> {
    if (reviewIds.length === 0) return [];

    return this.db
      .select(this._withUserColumns())
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
      .select(this._withUserColumns())
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
