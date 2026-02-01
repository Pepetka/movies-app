import { Inject, Injectable } from '@nestjs/common';
import { eq, asc } from 'drizzle-orm';

import { users, type User, type NewUser } from '../db/schemas';
import { DrizzleDb } from '../db/types/drizzle.types';
import { DRIZZLE } from '../db/db.module';

@Injectable()
export class UserRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(data: NewUser): Promise<User> {
    const [result] = await this.db.insert(users).values(data).returning();
    return result;
  }

  async findById(id: number): Promise<User | null> {
    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result ?? null;
  }

  async findAll(limit = 100, offset = 0): Promise<User[]> {
    return this.db
      .select()
      .from(users)
      .orderBy(asc(users.id))
      .limit(limit)
      .offset(offset);
  }

  async update(id: number, data: Partial<NewUser>): Promise<User> {
    const [result] = await this.db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result;
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id));
  }

  async emailExists(email: string): Promise<boolean> {
    const result = await this.findByEmail(email);
    return result !== null;
  }

  async updateRefreshTokenHash(id: number, hash: string | null): Promise<void> {
    await this.db
      .update(users)
      .set({ refreshTokenHash: hash, updatedAt: new Date() })
      .where(eq(users.id, id));
  }
}
