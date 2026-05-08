import { Inject, Injectable } from '@nestjs/common';
import { eq, asc } from 'drizzle-orm';

import { DrizzleDb, DrizzleTx } from '../db/types/drizzle.types';
import { users, type User, type NewUser } from '../db/schemas';
import { DRIZZLE } from '../db/db.module';

@Injectable()
export class UserRepository {
  constructor(@Inject(DRIZZLE) private readonly _db: DrizzleDb) {}

  async create(data: NewUser, tx?: DrizzleTx): Promise<User> {
    const conn = tx ?? this._db;
    const [result] = await conn.insert(users).values(data).returning();
    return result;
  }

  async findById(id: number, tx?: DrizzleTx): Promise<User | null> {
    const conn = tx ?? this._db;
    const [result] = await conn
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result ?? null;
  }

  async findByEmail(email: string, tx?: DrizzleTx): Promise<User | null> {
    const conn = tx ?? this._db;
    const [result] = await conn
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result ?? null;
  }

  async findAll(limit = 100, offset = 0): Promise<User[]> {
    const safeLimit = Math.min(limit, 100);
    return this._db
      .select()
      .from(users)
      .orderBy(asc(users.id))
      .limit(safeLimit)
      .offset(offset);
  }

  async update(
    id: number,
    data: Partial<NewUser>,
    tx?: DrizzleTx,
  ): Promise<User> {
    const conn = tx ?? this._db;
    const [result] = await conn
      .update(users)
      .set({ ...data })
      .where(eq(users.id, id))
      .returning();
    return result;
  }

  async delete(id: number): Promise<void> {
    await this._db.delete(users).where(eq(users.id, id));
  }

  async emailExists(email: string): Promise<boolean> {
    const result = await this.findByEmail(email);
    return result !== null;
  }

  async updateRefreshTokenHash(
    id: number,
    hash: string | null,
    tx?: DrizzleTx,
  ): Promise<void> {
    const conn = tx ?? this._db;
    await conn
      .update(users)
      .set({ refreshTokenHash: hash })
      .where(eq(users.id, id));
  }
}
