import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Logger } from 'pino';

import { LOGGER_ASYNC_STORAGE, ROOT_LOGGER } from './app-logger.constants';

@Injectable()
export class AppLoggerService implements LoggerService {
  constructor(@Inject(ROOT_LOGGER) private readonly _rootLogger: Logger) {}

  private get _logger(): Logger {
    const ctx = LOGGER_ASYNC_STORAGE.getStore();
    if (!ctx || !ctx.requestId) {
      return this._rootLogger;
    }
    return this._rootLogger.child({ requestId: ctx.requestId });
  }

  log(message: string, context?: string | Record<string, unknown>): void {
    this._logger.info(
      typeof context === 'string' ? { context } : context,
      message,
    );
  }

  warn(message: string, context?: string | Record<string, unknown>): void {
    this._logger.warn(
      typeof context === 'string' ? { context } : context,
      message,
    );
  }

  verbose(message: string, context?: string | Record<string, unknown>): void {
    this._logger.trace(
      typeof context === 'string' ? { context } : context,
      message,
    );
  }

  debug(message: string, context?: string | Record<string, unknown>): void {
    this._logger.debug(
      typeof context === 'string' ? { context } : context,
      message,
    );
  }

  error(
    message: string,
    trace?: string,
    context?: string | Record<string, unknown>,
  ): void {
    if (typeof context === 'string') {
      this._logger.error({ context, trace }, message);
    } else {
      this._logger.error({ ...context, trace }, message);
    }
  }

  fatal(
    message: string,
    trace?: string,
    context?: string | Record<string, unknown>,
  ): void {
    if (typeof context === 'string') {
      this._logger.fatal({ context, trace }, message);
    } else {
      this._logger.fatal({ ...context, trace }, message);
    }
  }
}
