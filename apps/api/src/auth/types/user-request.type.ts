import type { FastifyRequest } from 'fastify';

import type { User, GroupMember } from '$db/schemas';

export interface UserRequest extends FastifyRequest {
  user?: User;
  groupMember?: GroupMember;
}
