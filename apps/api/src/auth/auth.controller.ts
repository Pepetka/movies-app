import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  Res,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Throttle } from '@nestjs/throttler';

import type { User as UserType, AuthProvider } from '$db/schemas';
import { CsrfProtected, Public, User } from '$common/decorators';
import { Cookie } from '$common/decorators/cookie.decorator';
import { authProviderEnum } from '$db/schemas';
import { THROTTLE } from '$common/configs';

import {
  OAUTH_LINK_SUCCESS_PATH,
  OAUTH_SESSION_COOKIE_NAME,
  OAUTH_SESSION_COOKIE_MAX_AGE,
  OAUTH_SESSION_COOKIE_PATH,
  OAUTH_SUCCESS_PATH,
} from './oauth/oauth.constants';
import {
  AuthLoginDto,
  AuthRegisterDto,
  AuthResponseDto,
  OAuthCallbackQueryDto,
  OAuthLinkInitResponseDto,
} from './dto';
import {
  REFRESH_COOKIE_OPTIONS,
  REFRESH_COOKIE_NAME,
  RefreshCookieOptions,
} from './auth.constants';
import { ParseAuthProviderPipe } from './oauth/pipes/parse-auth-provider.pipe';
import { createOAuthSession } from './oauth/utils/create-oauth-session.util';
import { readOAuthSession } from './oauth/utils/parse-oauth-session.util';
import { RefreshGuard } from './guards/refresh.guard';
import { OAuthService } from './oauth/oauth.service';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly oauthService: OAuthService,
    @Inject(REFRESH_COOKIE_OPTIONS)
    private readonly cookieOptions: RefreshCookieOptions,
  ) {}

  @Public()
  @Post('register')
  @Throttle(THROTTLE.auth.critical)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async register(
    @Body() dto: AuthRegisterDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const tokens = await this.authService.register(dto);

    reply.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, this.cookieOptions);

    return { accessToken: tokens.accessToken };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle(THROTTLE.auth.critical)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() dto: AuthLoginDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const tokens = await this.authService.login(dto.email, dto.password);

    reply.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, this.cookieOptions);

    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 204, description: 'User successfully logged out' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @User() user: UserType,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    await this.authService.logout(user.id);

    reply.clearCookie(REFRESH_COOKIE_NAME, { path: this.cookieOptions.path });
  }

  @Public()
  @CsrfProtected()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshGuard)
  @Throttle(THROTTLE.auth.refresh)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Tokens successfully refreshed',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async refresh(
    @User() user: UserType,
    @Cookie(REFRESH_COOKIE_NAME) refreshToken: string,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const tokens = await this.authService.refresh(user, refreshToken);

    reply.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, this.cookieOptions);

    return { accessToken: tokens.accessToken };
  }

  @Public()
  @Get('oauth/:provider')
  @Throttle(THROTTLE.auth.oauth)
  @ApiParam({ name: 'provider', enum: [...authProviderEnum.enumValues] })
  @ApiOperation({ summary: 'Redirect to OAuth provider authorization page' })
  @ApiResponse({ status: 302, description: 'Redirect to provider' })
  @ApiResponse({ status: 400, description: 'Unsupported provider' })
  @ApiResponse({ status: 501, description: 'Provider not configured' })
  async oauthRedirect(
    @Param('provider', ParseAuthProviderPipe) provider: AuthProvider,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<void> {
    const { session, codeChallenge } = createOAuthSession('login');

    reply.cookie(OAUTH_SESSION_COOKIE_NAME, JSON.stringify(session), {
      httpOnly: true,
      signed: true,
      secure: this.cookieOptions.secure,
      sameSite: 'lax',
      path: OAUTH_SESSION_COOKIE_PATH,
      maxAge: OAUTH_SESSION_COOKIE_MAX_AGE,
    });

    const redirectUrl = this.oauthService.buildAuthUrl(
      provider,
      session.state,
      codeChallenge,
    );
    reply.redirect(redirectUrl, HttpStatus.FOUND);
  }

  @CsrfProtected()
  @Post('oauth/:provider/link/init')
  @HttpCode(HttpStatus.OK)
  @Throttle(THROTTLE.auth.oauth)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'provider', enum: [...authProviderEnum.enumValues] })
  @ApiOperation({
    summary: 'Init OAuth account linking — returns provider authUrl',
  })
  @ApiResponse({
    status: 200,
    description: 'Auth URL ready, cookie set',
    type: OAuthLinkInitResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Unsupported provider' })
  @ApiResponse({ status: 501, description: 'Provider not configured' })
  async oauthLinkInit(
    @Param('provider', ParseAuthProviderPipe) provider: AuthProvider,
    @User() user: UserType,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<{ authUrl: string }> {
    const { session, codeChallenge } = createOAuthSession('link', user.id);

    reply.cookie(OAUTH_SESSION_COOKIE_NAME, JSON.stringify(session), {
      httpOnly: true,
      signed: true,
      secure: this.cookieOptions.secure,
      sameSite: 'lax',
      path: OAUTH_SESSION_COOKIE_PATH,
      maxAge: OAUTH_SESSION_COOKIE_MAX_AGE,
    });

    const authUrl = this.oauthService.buildAuthUrl(
      provider,
      session.state,
      codeChallenge,
    );

    return { authUrl };
  }

  @Public()
  @Get('oauth/:provider/callback')
  @Throttle(THROTTLE.auth.oauth)
  @ApiParam({ name: 'provider', enum: [...authProviderEnum.enumValues] })
  @ApiOperation({ summary: 'OAuth callback — redirects to SPA after auth' })
  @ApiResponse({
    status: 302,
    description: 'Redirect to SPA /oauth/success or /oauth/error',
  })
  async oauthCallback(
    @Param('provider', ParseAuthProviderPipe) provider: AuthProvider,
    @Query() query: OAuthCallbackQueryDto,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<void> {
    const session = readOAuthSession(request);

    if (session.state !== query.state) {
      reply.clearCookie(OAUTH_SESSION_COOKIE_NAME, {
        path: OAUTH_SESSION_COOKIE_PATH,
        sameSite: 'lax',
        secure: this.cookieOptions.secure,
      });
      return reply.redirect(
        this.oauthService.buildErrorUrl('invalid_state'),
        HttpStatus.FOUND,
      );
    }

    reply.clearCookie(OAUTH_SESSION_COOKIE_NAME, {
      path: OAUTH_SESSION_COOKIE_PATH,
      sameSite: 'lax',
      secure: this.cookieOptions.secure,
    });

    if (query.error) {
      return reply.redirect(
        this.oauthService.buildErrorUrl(query.error),
        HttpStatus.FOUND,
      );
    }
    if (!query.code) {
      return reply.redirect(
        this.oauthService.buildErrorUrl('missing_code'),
        HttpStatus.FOUND,
      );
    }

    try {
      if (session.intent === 'login') {
        const result = await this.oauthService.handleCallback(
          provider,
          query.code,
          session.codeVerifier,
        );

        reply.cookie(
          REFRESH_COOKIE_NAME,
          result.refreshToken,
          this.cookieOptions,
        );

        const webUrl = this.oauthService.getPrimaryWebUrl();
        reply.redirect(`${webUrl}${OAUTH_SUCCESS_PATH}`, HttpStatus.FOUND);
        return;
      }

      if (session.intent === 'link') {
        if (!session.userId) {
          reply.redirect(
            this.oauthService.buildErrorUrl('invalid_session'),
            HttpStatus.FOUND,
          );
          return;
        }
        await this.oauthService.linkProvider(
          session.userId,
          provider,
          query.code,
          session.codeVerifier,
        );
        const webUrl = this.oauthService.getPrimaryWebUrl();
        reply.redirect(`${webUrl}${OAUTH_LINK_SUCCESS_PATH}`, HttpStatus.FOUND);
        return;
      }

      reply.redirect(
        this.oauthService.buildErrorUrl('invalid_intent'),
        HttpStatus.FOUND,
      );
    } catch (e) {
      const reason = this.oauthService.mapErrorToReason(e);
      reply.redirect(this.oauthService.buildErrorUrl(reason), HttpStatus.FOUND);
    }
  }
}
