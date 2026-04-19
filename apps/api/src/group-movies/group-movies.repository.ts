import { eq, and, desc, ilike, or } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';

import { groupMovies, type GroupMovie, type NewGroupMovie } from '$db/schemas';
import { DrizzleDb } from '$db/types/drizzle.types';
import { escapeLikePattern } from '$common/utils';
import { GroupMovieStatus } from '$common/enums';
import { DRIZZLE } from '$db/db.module';

export interface FindGroupMoviesOptions {
  status?: GroupMovieStatus;
  query?: string;
}

@Injectable()
export class GroupMoviesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(data: NewGroupMovie): Promise<GroupMovie> {
    const [result] = await this.db.insert(groupMovies).values(data).returning();
    return result;
  }

  async findByGroup(
    groupId: number,
    options?: FindGroupMoviesOptions,
    limit = 100,
    offset = 0,
  ): Promise<GroupMovie[]> {
    const conditions = [eq(groupMovies.groupId, groupId)];

    if (options?.status) {
      conditions.push(eq(groupMovies.status, options.status));
    }

    if (options?.query) {
      const escapedQuery = escapeLikePattern(options.query);
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
    const [result] = await this.db
      .select({ id: groupMovies.id })
      .from(groupMovies)
      .where(
        and(eq(groupMovies.groupId, groupId), eq(groupMovies.movieId, movieId)),
      )
      .limit(1);
    return !!result;
  }

  async update(
    groupId: number,
    id: number,
    data: Partial<NewGroupMovie>,
  ): Promise<GroupMovie> {
    const [result] = await this.db
      .update(groupMovies)
      .set({ ...data })
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
