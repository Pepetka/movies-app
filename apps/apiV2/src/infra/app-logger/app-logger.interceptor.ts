import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';

import { LOGGER_ASYNC_STORAGE } from './app-logger.constants';

@Injectable()
export class AppLoggerContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const store = {
      requestId: request.requestId ?? 'unknown',
    };

    return new Observable((subscriber) => {
      LOGGER_ASYNC_STORAGE.run(store, () => {
        next.handle().subscribe(subscriber);
      });
    });
  }
}
