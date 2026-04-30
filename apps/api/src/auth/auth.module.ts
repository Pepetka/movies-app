import { ConfigService, ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UserModule } from '$src/user/user.module';
import { Environment } from '$common/configs';
import { parseDuration } from '$common/utils';

import {
  JWT_ACCESS_AUDIENCE,
  REFRESH_COOKIE_OPTIONS,
  REFRESH_COOKIE_PATH,
  RefreshCookieOptions,
} from './auth.constants';
import { RefreshGuard } from './guards/refresh.guard';
import type { Expires } from './types/expires.type';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<Expires>('JWT_ACCESS_EXPIRATION'),
          issuer: configService.getOrThrow<string>('JWT_ISSUER'),
          audience: JWT_ACCESS_AUDIENCE,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RefreshGuard,
    {
      provide: REFRESH_COOKIE_OPTIONS,
      useFactory: (configService: ConfigService): RefreshCookieOptions => {
        const refreshExpiration = configService.getOrThrow<string>(
          'JWT_REFRESH_EXPIRATION',
        );
        return {
          httpOnly: true,
          secure: configService.get('NODE_ENV') !== Environment.Development,
          sameSite: 'strict',
          path: REFRESH_COOKIE_PATH,
          maxAge: parseDuration(refreshExpiration),
        };
      },
      inject: [ConfigService],
    },
  ],
  exports: [AuthService, REFRESH_COOKIE_OPTIONS, JwtModule],
})
export class AuthModule {}
