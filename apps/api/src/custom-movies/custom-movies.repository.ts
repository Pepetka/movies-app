import { eq, and, ilike, or, asc } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';

import {
  customMovies,
  groupMembers,
  type CustomMovie,
  type NewCustomMovie,
} from '$db/schemas';
import { DrizzleDb } from '$db/types/drizzle.types';
import { DRIZZLE } from '$db/db.module';

@Injectable()
export class CustomMoviesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(data: NewCustomMovie): Promise<CustomMovie> {
    const [result] = await this.db
      .insert(customMovies)
      .values(data)
      .returning();
    return result;
  }

  async findById(id: number): Promise<CustomMovie | null> {
    const [result] = await this.db
      .select()
      .from(customMovies)
      .where(eq(customMovies.id, id))
      .limit(1);
    return result ?? null;
  }

  async findByGroup(
    groupId: number,
    query?: string,
    limit = 50,
    offset = 0,
  ): Promise<CustomMovie[]> {
    const whereClause = query
      ? and(
          eq(customMovies.groupId, groupId),
          or(
            ilike(customMovies.title, `%${query}%`),
            ilike(customMovies.overview, `%${query}%`),
          ),
        )
      : eq(customMovies.groupId, groupId);

    return this.db
      .select()
      .from(customMovies)
      .where(whereClause)
      .orderBy(asc(customMovies.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async findByUserGroups(
    userId: number,
    query?: string,
    limit = 50,
    offset = 0,
  ): Promise<CustomMovie[]> {
    const whereClause = query
      ? and(
          eq(groupMembers.userId, userId),
          or(
            ilike(customMovies.title, `%${query}%`),
            ilike(customMovies.overview, `%${query}%`),
          ),
        )
      : eq(groupMembers.userId, userId);

    const result = await this.db
      .select()
      .from(customMovies)
      .innerJoin(groupMembers, eq(customMovies.groupId, groupMembers.groupId))
      .where(whereClause)
      .orderBy(asc(customMovies.createdAt))
      .limit(limit)
      .offset(offset);

    return result.map(
      (row: { custom_movies: CustomMovie }) => row.custom_movies,
    );
  }

  async update(
    id: number,
    data: Partial<NewCustomMovie>,
  ): Promise<CustomMovie> {
    const [result] = await this.db
      .update(customMovies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customMovies.id, id))
      .returning();
    return result;
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(customMovies).where(eq(customMovies.id, id));
  }

  async countByGroup(groupId: number): Promise<number> {
    const result = await this.db
      .select({ count: customMovies.id })
      .from(customMovies)
      .where(eq(customMovies.groupId, groupId));
    return result.length;
  }
}
