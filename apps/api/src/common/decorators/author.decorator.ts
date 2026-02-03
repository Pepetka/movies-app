import { SetMetadata } from '@nestjs/common';

export const AUTHOR_KEY = Symbol('author');

export type AuthorSource = 'params' | 'body' | 'query';

export interface AuthorOptions {
  from: AuthorSource;
  key: string;
}

export const Author = (options: AuthorOptions) =>
  SetMetadata(AUTHOR_KEY, options);
