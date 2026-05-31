import pino from 'pino';

export const createRootLogger = (isDev: boolean, logLevel?: string) => {
  const level = logLevel ?? (isDev ? 'debug' : 'info');

  return pino({
    level,
    transport: isDev
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
            singleLine: true,
          },
        }
      : undefined,
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.headers["x-csrf-token"]',
        'password',
        'token',
      ],
      censor: '[REDACTED]',
    },
  });
};
