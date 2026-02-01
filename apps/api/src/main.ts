import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import fastifyCookie from '@fastify/cookie';
import csrf from '@fastify/csrf-protection';
import { Logger } from '@nestjs/common';
import helmet from '@fastify/helmet';

import { Environment } from '$common/configs/validation';
import { getHelmetConfig } from '$common/configs/helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);

  const frontUrl = configService.getOrThrow<string>('WEB_URL');
  app.enableCors({
    origin: [frontUrl],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const secret = configService.getOrThrow<string>('COOKIE_SECRET');
  const env = configService.getOrThrow<Environment>('NODE_ENV');

  // @ts-expect-error Fastify plugin types are incompatible with NestFastifyApplication.register()
  await app.register(helmet, getHelmetConfig(env === Environment.Production));
  // @ts-expect-error Fastify plugin types are incompatible with NestFastifyApplication.register()
  await app.register(fastifyCookie, { secret });

  // @ts-expect-error Fastify plugin types are incompatible with NestFastifyApplication.register()
  await app.register(csrf, {
    cookieOpts: {
      httpOnly: true,
      secure: configService.get('NODE_ENV') === Environment.Production,
      sameSite: 'strict',
      path: '/',
    },
  });

  app.enableShutdownHooks();

  if (env !== Environment.Production) {
    const config = new DocumentBuilder()
      .setTitle('Movies App API')
      .setDescription('REST API for Movies application')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT access token',
        },
        'access-token',
      )
      .addSecurityRequirements('access-token')
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, documentFactory, {
      jsonDocumentUrl: 'api/docs/json',
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = configService.getOrThrow<number>('PORT');
  await app.listen(port, '0.0.0.0');

  const logger = new Logger('Bootstrap');
  logger.log(`Application is running on port ${port} [${env}]`);
}
void bootstrap();
