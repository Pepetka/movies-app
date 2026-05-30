import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { AppConfigService } from '$infra/app-config';
import { ValidationError } from '$infra/validation';

import { DomainError, HealthCheckError } from './errors';
import { ERROR_MAP } from './error-map';

interface ErrorPayload {
  code: string;
  message: string;
  requestId?: string;
  stack?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly _logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly _configService: AppConfigService) {}

  catch(error: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();
    const requestId = request.requestId ?? 'unknown';

    const { status, payload } = this._resolve(error, requestId);
    this._log(error, status, request, requestId);

    response.status(status).send(payload);
  }

  private _resolve(
    error: unknown,
    requestId?: string,
  ): { status: number; payload: unknown } {
    if (error instanceof HealthCheckError) {
      const status =
        ERROR_MAP.get(HealthCheckError) ?? HttpStatus.SERVICE_UNAVAILABLE;

      return {
        status,
        payload: error.result,
      };
    }

    if (error instanceof DomainError) {
      const status = ERROR_MAP.get(
        error.constructor as new (...args: any[]) => Error,
      );

      if (!status) {
        this._logger.warn(
          `Domain error ${error.constructor.name} not found in ERROR_MAP`,
        );
      }

      if (status) {
        return {
          status,
          payload: {
            code: this._camelToScreamingSnake(
              error.constructor.name.replace(/Error$/, ''),
            ),
            message: error.message,
            requestId,
          },
        };
      }
    }

    if (error instanceof ValidationError) {
      return {
        status: error.getStatus(),
        payload: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.details,
          requestId,
        },
      };
    }

    if (error instanceof HttpException) {
      const response = error.getResponse();
      const rawMessage =
        typeof response === 'string'
          ? response
          : (response as { message?: string | string[] }).message;
      const message = Array.isArray(rawMessage)
        ? rawMessage.join(', ')
        : (rawMessage ?? error.message);
      return {
        status: error.getStatus(),
        payload: {
          code: 'HTTP_ERROR',
          message,
          requestId,
        },
      };
    }

    const isDev = this._configService.isDev;
    const payload: ErrorPayload = {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      requestId,
    };
    if (isDev && error instanceof Error) {
      payload.message = error.message;
      payload.stack = error.stack;
    }

    return { status: HttpStatus.INTERNAL_SERVER_ERROR, payload };
  }

  private _log(
    error: unknown,
    status: number,
    request: FastifyRequest,
    requestId?: string,
  ): void {
    const message = `[${request.method}] ${request.url} -> ${status} | requestId=${requestId}`;

    if (error instanceof HealthCheckError) {
      this._logger.debug(message);
      return;
    }

    if (status >= 500) {
      this._logger.error(
        message,
        error instanceof Error ? error.stack : String(error),
      );
    } else {
      this._logger.warn(message);
    }
  }

  private _camelToScreamingSnake(str: string): string {
    return str
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
      .toUpperCase();
  }
}
