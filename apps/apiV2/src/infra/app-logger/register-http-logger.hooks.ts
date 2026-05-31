import type { NestFastifyApplication } from '@nestjs/platform-fastify';

import { HTTP_LOGGER_IGNORE_PATHS } from './app-logger.constants';
import type { AppLoggerService } from './app-logger.service';

export const registerHttpLoggerHooks = (
  app: NestFastifyApplication,
  loggerService: AppLoggerService,
): void => {
  const instance = app.getHttpAdapter().getInstance();

  instance.addHook('onRequest', async (request) => {
    const ignore = HTTP_LOGGER_IGNORE_PATHS.find((p: RegExp) =>
      p.test(request.url),
    );
    if (ignore) return;
    loggerService.log('Request started', {
      req: {
        method: request.method,
        url: request.url,
        requestId: request.requestId,
      },
    });
  });

  instance.addHook('onResponse', async (request, reply) => {
    const ignore = HTTP_LOGGER_IGNORE_PATHS.find((p: RegExp) =>
      p.test(request.url),
    );
    if (ignore) return;
    loggerService.log('Request completed', {
      res: {
        statusCode: reply.statusCode,
        responseTime: reply.elapsedTime,
      },
    });
  });
};
