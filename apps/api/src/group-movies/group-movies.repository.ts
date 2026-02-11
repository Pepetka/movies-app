import { Inject, Injectable } from '@nestjs/common';
import { eq, and, desc, count } from 'drizzle-orm';

import { groupMovies, type GroupMovie, type NewGroupMovie } from '$db/schemas';
import { DrizzleDb } from '$db/types/drizzle.types';
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
    limit = 100,
    offset = 0,
  ): Promise<GroupMovie[]> {
    return this.db
      .select()
      .from(groupMovies)
      .where(eq(groupMovies.groupId, groupId))
      .orderBy(desc(groupMovies.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async findOne(groupId: number, movieId: number): Promise<GroupMovie | null> {
    const [result] = await this.db
      .select()
      .from(groupMovies)
      .where(
        and(eq(groupMovies.groupId, groupId), eq(groupMovies.movieId, movieId)),
      )
      .limit(1);
    return result ?? null;
  }

  async exists(groupId: number, movieId: number): Promise<boolean> {
    const result = await this.findOne(groupId, movieId);
    return result !== null;
  }

  async countByMovie(movieId: number): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(groupMovies)
      .where(eq(groupMovies.movieId, movieId));
    return result[0].count;
  }

  async update(
    groupId: number,
    movieId: number,
    data: Partial<NewGroupMovie>,
  ): Promise<GroupMovie> {
    const [result] = await this.db
      .update(groupMovies)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(eq(groupMovies.groupId, groupId), eq(groupMovies.movieId, movieId)),
      )
      .returning();
    return result;
  }

  async delete(groupId: number, movieId: number): Promise<void> {
    await this.db
      .delete(groupMovies)
      .where(
        and(eq(groupMovies.groupId, groupId), eq(groupMovies.movieId, movieId)),
      );
  }
}
