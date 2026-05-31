import 'reflect-metadata';
import 'dotenv/config';

import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { VersioningType } from '@nestjs/common';
import fastifyCookie from '@fastify/cookie';
import csrf from '@fastify/csrf-protection';
import { NestFactory } from '@nestjs/core';
import helmet from '@fastify/helmet';

import { AppLoggerService, registerHttpLoggerHooks } from '$infra/app-logger';
import { registerRequestIdHooks } from '$infra/observability';
import { AppConfigService } from '$infra/app-config';
import { getHelmetConfig } from '$infra/security';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true },
  );

  const loggerService = app.get(AppLoggerService);

  app.useLogger(loggerService);
  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '2',
  });

  const configService = app.get(AppConfigService);
  const apiUrl = configService.get('API_URL');
  const webUrls = configService.get('WEB_URL');
  const secret = configService.get('COOKIE_SECRET');
  const port = configService.get('PORT');
  const env = configService.get('NODE_ENV');
  const logHttpRequests = configService.get('LOG_HTTP_REQUESTS');

  app.enableCors({
    origin: webUrls,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-csrf-token',
      'x-request-id',
    ],
  });

  await app.register(helmet, getHelmetConfig(configService));
  await app.register(fastifyCookie, { secret });
  await app.register(csrf, {
    cookieOpts: {
      httpOnly: true,
      secure: configService.isProd,
      sameSite: 'strict',
      path: '/',
    },
  });

  app.enableShutdownHooks();
  registerRequestIdHooks(app);
  if (logHttpRequests) {
    registerHttpLoggerHooks(app, loggerService);
  }

  if (configService.isDev) {
    const config = new DocumentBuilder()
      .setTitle('Movies App API')
      .setVersion('2')
      .setDescription(
        'REST API for Movies application\n\n' +
          '**Links:**\n' +
          '- [OpenAPI JSON](/api/docs/json)\n' +
          '- [OpenAPI YAML](/api/docs/yaml)',
      )
      .addServer(apiUrl)
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, documentFactory, {
      jsonDocumentUrl: 'api/docs/json',
      yamlDocumentUrl: 'api/docs/yaml',
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  await app.listen(port, '0.0.0.0');

  loggerService.log(
    `Application is running on port ${port} [${env}]`,
    'Bootstrap',
  );
}
void bootstrap();
