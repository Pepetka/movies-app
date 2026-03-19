import { eq, and, desc, count, ilike, or } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';

import { groupMovies, type GroupMovie, type NewGroupMovie } from '$db/schemas';
import { DrizzleDb } from '$db/types/drizzle.types';
import { escapeLikePattern } from '$common/utils';
import { DRIZZLE } from '$db/db.module';

@Injectable()
export class GroupMoviesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(data: NewGroupMovie): Promise<GroupMovie> {
    const [result] = await this.db.insert(groupMovies).values(data).returning();
    return result;
  }

  async findByGroup(
    groupId: number,
    status?: string,
    query?: string,
    limit = 100,
    offset = 0,
  ): Promise<GroupMovie[]> {
    const conditions = [eq(groupMovies.groupId, groupId)];

    if (status) {
      conditions.push(
        eq(groupMovies.status, status as 'tracking' | 'planned' | 'watched'),
      );
    }

    if (query) {
      const escapedQuery = escapeLikePattern(query);
      const searchCondition = or(
        ilike(groupMovies.title, `%${escapedQuery}%`),
        ilike(groupMovies.overview, `%${escapedQuery}%`),
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    return this.db
      .select()
      .from(groupMovies)
      .where(and(...conditions))
      .orderBy(desc(groupMovies.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async findOne(groupId: number, id: number): Promise<GroupMovie | null> {
    const [result] = await this.db
      .select()
      .from(groupMovies)
      .where(and(eq(groupMovies.groupId, groupId), eq(groupMovies.id, id)))
      .limit(1);
    return result ?? null;
  }

  async exists(groupId: number, movieId: number): Promise<boolean> {
    const result = await this.db
      .select({ count: count() })
      .from(groupMovies)
      .where(
        and(eq(groupMovies.groupId, groupId), eq(groupMovies.movieId, movieId)),
      );
    return result[0].count > 0;
  }

  async update(
    groupId: number,
    id: number,
    data: Partial<NewGroupMovie>,
  ): Promise<GroupMovie> {
    const [result] = await this.db
      .update(groupMovies)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(groupMovies.groupId, groupId), eq(groupMovies.id, id)))
      .returning();
    return result;
  }

  async delete(groupId: number, id: number): Promise<void> {
    await this.db
      .delete(groupMovies)
      .where(and(eq(groupMovies.groupId, groupId), eq(groupMovies.id, id)));
  }
}
