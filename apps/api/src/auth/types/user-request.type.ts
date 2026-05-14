import type { FastifyRequest } from 'fastify';

import type { User, GroupMember, GroupMovieReview } from '$db/schemas';

export interface UserRequest extends FastifyRequest {
  user?: User;
  groupMember?: GroupMember;
  review?: GroupMovieReview;
}
