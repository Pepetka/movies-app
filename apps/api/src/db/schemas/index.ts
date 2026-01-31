import { users } from './users';

export * from './users';
export * from './movies';

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
