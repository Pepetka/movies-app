import { AsyncLocalStorage } from 'node:async_hooks';

export const ROOT_LOGGER = Symbol('logger');

export const LOGGER_ASYNC_STORAGE = new AsyncLocalStorage<{
  requestId?: string;
}>();

export const HTTP_LOGGER_IGNORE_PATHS = [
  new RegExp('^/api/v\\d+/health(?:/.*)?(?:\\?.*)?$'),
  new RegExp('^/api/docs(?:/.*)?(?:\\?.*)?$'),
];
