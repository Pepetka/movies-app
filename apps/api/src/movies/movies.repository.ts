import { Inject, Injectable } from '@nestjs/common';
import { eq, asc } from 'drizzle-orm';

import { movies, type Movie, type NewMovie } from '../db/schemas';
import { DrizzleDb } from '../db/types/drizzle.types';
import { DRIZZLE } from '../db/db.module';

@Injectable()
export class MoviesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(data: NewMovie): Promise<Movie> {
    const [result] = await this.db.insert(movies).values(data).returning();
    return result;
  }

  async findById(id: number): Promise<Movie | null> {
    const [result] = await this.db
      .select()
      .from(movies)
      .where(eq(movies.id, id))
      .limit(1);
    return result ?? null;
  }

  async findByExternalId(externalId: string): Promise<Movie | null> {
    const [result] = await this.db
      .select()
      .from(movies)
      .where(eq(movies.externalId, externalId))
      .limit(1);
    return result ?? null;
  }

  async findByImdbId(imdbId: string): Promise<Movie | null> {
    const [result] = await this.db
      .select()
      .from(movies)
      .where(eq(movies.imdbId, imdbId))
      .limit(1);
    return result ?? null;
  }

  async findAll(limit = 100, offset = 0): Promise<Movie[]> {
    return this.db
      .select()
      .from(movies)
      .orderBy(asc(movies.id))
      .limit(limit)
      .offset(offset);
  }

  async update(id: number, data: Partial<NewMovie>): Promise<Movie> {
    const [result] = await this.db
      .update(movies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(movies.id, id))
      .returning();
    return result;
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(movies).where(eq(movies.id, id));
  }
}
