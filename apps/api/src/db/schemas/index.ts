import {
  groupMovies,
  movieSourceEnum,
  groupMovieStatusEnum,
} from './group-movies';
import { groupMovieReviewReactions } from './group-movie-review-reactions';
import { groupMovieReviews } from './group-movie-reviews';
import { oauthAccounts } from './oauth-accounts';
import { groupMembers } from './group-members';
import { movies } from './movies';
import { groups } from './groups';
import { users } from './users';

export * from './users';
export * from './movies';
export * from './groups';
export * from './group-members';
export * from './group-movies';
export * from './group-movie-reviews';
export * from './group-movie-review-reactions';
export * from './auth-providers';
export * from './oauth-accounts';

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

export type GroupMovieReview = typeof groupMovieReviews.$inferSelect;
export type NewGroupMovieReview = typeof groupMovieReviews.$inferInsert;

export type GroupMovieReviewReaction =
  typeof groupMovieReviewReactions.$inferSelect;
export type NewGroupMovieReviewReaction =
  typeof groupMovieReviewReactions.$inferInsert;

export type OAuthAccount = typeof oauthAccounts.$inferSelect;
export type NewOAuthAccount = typeof oauthAccounts.$inferInsert;

export type MovieSource = typeof movieSourceEnum;
export type GroupMovieStatus = typeof groupMovieStatusEnum;
