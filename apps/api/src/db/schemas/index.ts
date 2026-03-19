import {
  groupMovies,
  movieSourceEnum,
  groupMovieStatusEnum,
} from './group-movies';
import { groupMembers } from './group-members';
import { movies } from './movies';
import { groups } from './groups';
import { users } from './users';

export * from './users';
export * from './movies';
export * from './groups';
export * from './group-members';
export * from './group-movies';

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Movie = typeof movies.$inferSelect;
export type NewMovie = typeof movies.$inferInsert;

export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;

export type GroupMember = typeof groupMembers.$inferSelect;
export type NewGroupMember = typeof groupMembers.$inferInsert;

export type GroupMovie = typeof groupMovies.$inferSelect;
export type NewGroupMovie = typeof groupMovies.$inferInsert;

export type MovieSource = typeof movieSourceEnum;
export type GroupMovieStatus = typeof groupMovieStatusEnum;
