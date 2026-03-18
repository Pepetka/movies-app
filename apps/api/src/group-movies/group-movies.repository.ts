import { Inject, Injectable } from '@nestjs/common';
import { eq, and, desc, count } from 'drizzle-orm';

import {
  groupMovies,
  movies,
  type GroupMovie,
  type NewGroupMovie,
} from '$db/schemas';
import { DrizzleDb } from '$db/types/drizzle.types';
import { DRIZZLE } from '$db/db.module';

export type GroupMovieWithDetails = GroupMovie & {
  title: string;
  posterPath: string | null;
  overview: string | null;
  releaseYear: number | null;
  runtime: number | null;
  rating: string | null;
};

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

  async findByGroupWithDetails(
    groupId: number,
    limit = 100,
    offset = 0,
  ): Promise<GroupMovieWithDetails[]> {
    return this.db
      .select({
        id: groupMovies.id,
        groupId: groupMovies.groupId,
        movieId: groupMovies.movieId,
        addedBy: groupMovies.addedBy,
        status: groupMovies.status,
        plannedDate: groupMovies.plannedDate,
        watchedDate: groupMovies.watchedDate,
        createdAt: groupMovies.createdAt,
        updatedAt: groupMovies.updatedAt,
        title: movies.title,
        posterPath: movies.posterPath,
        overview: movies.overview,
        releaseYear: movies.releaseYear,
        runtime: movies.runtime,
        rating: movies.rating,
      })
      .from(groupMovies)
      .innerJoin(movies, eq(groupMovies.movieId, movies.id))
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
