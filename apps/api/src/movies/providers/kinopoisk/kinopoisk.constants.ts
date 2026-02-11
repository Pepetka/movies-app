export const KINOPOISK_API_OPTIONS = Symbol('KINOPOISK_API_OPTIONS');

export interface KinopoiskApiOptions {
  baseUrl: string;
  apiKey: string;
}
