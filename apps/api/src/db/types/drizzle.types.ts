import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import * as schema from '../schemas';

export type DrizzleDb = PostgresJsDatabase<typeof schema>;
