import { ConfigService, ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UserModule } from '$src/user/user.module';
import { Environment } from '$common/configs';
import { parseDuration } from '$common/utils';

import {
  REFRESH_COOKIE_OPTIONS,
  REFRESH_COOKIE_PATH,
  RefreshCookieOptions,
} from './auth.constants';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { AuthService, Expires } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<Expires>('JWT_ACCESS_EXPIRATION'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    {
      provide: REFRESH_COOKIE_OPTIONS,
      useFactory: (configService: ConfigService): RefreshCookieOptions => {
        const refreshExpiration = configService.getOrThrow<string>(
          'JWT_REFRESH_EXPIRATION',
        );
        return {
          httpOnly: true,
          secure: configService.get('NODE_ENV') === Environment.Production,
          sameSite: 'strict',
          path: REFRESH_COOKIE_PATH,
          maxAge: parseDuration(refreshExpiration),
        };
      },
      inject: [ConfigService],
    },
  ],
  exports: [AuthService, REFRESH_COOKIE_OPTIONS],
})
export class AuthModule {}
