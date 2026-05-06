import { Inject, Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';

import {
  oauthAccounts,
  type OAuthAccount,
  type NewOAuthAccount,
} from '$db/schemas';
import type { DrizzleDb, DrizzleTx } from '$db/types/drizzle.types';
import { AuthProvider } from '$common/enums';
import { DRIZZLE } from '$db/db.module';

@Injectable()
export class OAuthAccountRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(data: NewOAuthAccount, tx?: DrizzleTx): Promise<OAuthAccount> {
    const conn = tx ?? this.db;
    const [result] = await conn.insert(oauthAccounts).values(data).returning();
    return result;
  }

  async findByProviderAccount(
    provider: AuthProvider,
    providerAccountId: string,
    tx?: DrizzleTx,
  ): Promise<OAuthAccount | null> {
    const conn = tx ?? this.db;
    const [result] = await conn
      .select()
      .from(oauthAccounts)
      .where(
        and(
          eq(oauthAccounts.provider, provider),
          eq(oauthAccounts.providerAccountId, providerAccountId),
        ),
      )
      .limit(1);
    return result ?? null;
  }

  async findByUserId(userId: number, tx?: DrizzleTx): Promise<OAuthAccount[]> {
    const conn = tx ?? this.db;
    return conn
      .select()
      .from(oauthAccounts)
      .where(eq(oauthAccounts.userId, userId));
  }
}
