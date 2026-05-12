import { eq, and, desc, sql, getTableColumns, inArray } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';

import {
  groupMovieReviews,
  users,
  type GroupMovieReview,
  type NewGroupMovieReview,
} from '$db/schemas';
import { DrizzleDb } from '$db/types/drizzle.types';
import { DRIZZLE } from '$db/db.module';

export interface GroupMovieReviewWithUser extends GroupMovieReview {
  userName: string;
}

@Injectable()
export class GroupMovieReviewsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(data: NewGroupMovieReview): Promise<GroupMovieReviewWithUser> {
    const inserted = this.db
      .$with('inserted')
      .as(this.db.insert(groupMovieReviews).values(data).returning());

    const [result] = await this.db
      .with(inserted)
      .select({
        ...getTableColumns(groupMovieReviews),
        userName: users.name,
      })
      .from(inserted)
      .innerJoin(users, eq(inserted.userId, users.id));

    if (!result) {
      throw new Error('Review not found after create');
    }
    return result;
  }

  async findByGroupMovie(
    groupMovieId: number,
  ): Promise<GroupMovieReviewWithUser[]> {
    return this.db
      .select({
        ...getTableColumns(groupMovieReviews),
        userName: users.name,
      })
      .from(groupMovieReviews)
      .innerJoin(users, eq(groupMovieReviews.userId, users.id))
      .where(eq(groupMovieReviews.groupMovieId, groupMovieId))
      .orderBy(desc(groupMovieReviews.createdAt));
  }

  async findOne(id: number): Promise<GroupMovieReview | null> {
    const [result] = await this.db
      .select()
      .from(groupMovieReviews)
      .where(eq(groupMovieReviews.id, id))
      .limit(1);
    return result ?? null;
  }

  async findOneWithUser(id: number): Promise<GroupMovieReviewWithUser | null> {
    const [result] = await this.db
      .select({
        ...getTableColumns(groupMovieReviews),
        userName: users.name,
      })
      .from(groupMovieReviews)
      .innerJoin(users, eq(groupMovieReviews.userId, users.id))
      .where(eq(groupMovieReviews.id, id))
      .limit(1);
    return result ?? null;
  }

  async findByUserAndGroupMovie(
    userId: number,
    groupMovieId: number,
  ): Promise<GroupMovieReviewWithUser | null> {
    const [result] = await this.db
      .select({
        ...getTableColumns(groupMovieReviews),
        userName: users.name,
      })
      .from(groupMovieReviews)
      .innerJoin(users, eq(groupMovieReviews.userId, users.id))
      .where(
        and(
          eq(groupMovieReviews.userId, userId),
          eq(groupMovieReviews.groupMovieId, groupMovieId),
        ),
      )
      .limit(1);
    return result ?? null;
  }

  async update(
    id: number,
    data: Partial<NewGroupMovieReview>,
  ): Promise<GroupMovieReviewWithUser> {
    const updated = this.db.$with('updated').as(
      this.db
        .update(groupMovieReviews)
        .set({ ...data })
        .where(eq(groupMovieReviews.id, id))
        .returning(),
    );

    const [result] = await this.db
      .with(updated)
      .select({
        ...getTableColumns(groupMovieReviews),
        userName: users.name,
      })
      .from(updated)
      .innerJoin(users, eq(updated.userId, users.id));

    if (!result) {
      throw new Error('Review not found after update');
    }
    return result;
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(groupMovieReviews).where(eq(groupMovieReviews.id, id));
  }

  async getAverageRating(groupMovieId: number): Promise<number | null> {
    const [result] = await this.db
      .select({
        average: sql<number>`AVG(${groupMovieReviews.rating})`,
      })
      .from(groupMovieReviews)
      .where(eq(groupMovieReviews.groupMovieId, groupMovieId));

    if (result?.average == null) return null;
    return Number(result.average) || null;
  }

  async getStatsByGroupMovieIds(
    groupMovieIds: number[],
  ): Promise<Map<number, { averageRating: number | null; count: number }>> {
    if (groupMovieIds.length === 0) return new Map();

    const results = await this.db
      .select({
        groupMovieId: groupMovieReviews.groupMovieId,
        average: sql<number>`AVG(${groupMovieReviews.rating})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(groupMovieReviews)
      .where(inArray(groupMovieReviews.groupMovieId, groupMovieIds))
      .groupBy(groupMovieReviews.groupMovieId);

    const map = new Map<
      number,
      { averageRating: number | null; count: number }
    >();
    for (const r of results) {
      map.set(r.groupMovieId, {
        averageRating: r.average == null ? null : Number(r.average) || null,
        count: Number(r.count),
      });
    }
    return map;
  }
}
