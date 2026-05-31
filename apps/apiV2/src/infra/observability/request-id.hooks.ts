import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { randomUUID } from 'node:crypto';

export const registerRequestIdHooks = (app: NestFastifyApplication): void => {
  const instance = app.getHttpAdapter().getInstance();

  instance.addHook('onRequest', async (request, reply) => {
    const raw = request.headers['x-request-id'];
    const requestId = Array.isArray(raw) ? raw[0] : raw || randomUUID();
    request.requestId = requestId;
    reply.header('x-request-id', requestId);
  });
};
