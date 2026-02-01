import type { FastifyRequest } from 'fastify';

import type { User } from '$db/schemas';

export interface UserRequest extends FastifyRequest {
  user?: User;
}
