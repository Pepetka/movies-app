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
  SerializeOptions,
  Inject,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Throttle } from '@nestjs/throttler';

import { CsrfProtected, Public, User } from '$common/decorators';
import { Cookie } from '$common/decorators/cookie.decorator';
import type { User as UserType } from '$db/schemas';
import { AuthProvider } from '$common/enums';
import { THROTTLE } from '$common/configs';

import {
  OAUTH_SESSION_COOKIE_NAME,
  OAUTH_SESSION_COOKIE_MAX_AGE,
  OAUTH_SESSION_COOKIE_PATH,
} from './oauth/oauth.constants';
import {
  REFRESH_COOKIE_OPTIONS,
  REFRESH_COOKIE_NAME,
  RefreshCookieOptions,
} from './auth.constants';
import {
  AuthLoginDto,
  AuthRegisterDto,
  AuthResponseDto,
  OAuthLinkInitResponseDto,
} from './dto';
import { ParseAuthProviderPipe } from './oauth/pipes/parse-auth-provider.pipe';
import { createOAuthSession } from './oauth/utils/create-oauth-session.util';
import { readOAuthSession } from './oauth/utils/read-oauth-session.util';
import type { OAuthSession } from './oauth/types/oauth.types';
import { RefreshGuard } from './guards/refresh.guard';
import { OAuthService } from './oauth/oauth.service';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@ApiBearerAuth('access-token')
@Controller('auth')
export class AuthController {
  private readonly _logger = new Logger(AuthController.name);

  constructor(
    private readonly _authService: AuthService,
    private readonly _oauthService: OAuthService,
    @Inject(REFRESH_COOKIE_OPTIONS)
    private readonly _cookieOptions: RefreshCookieOptions,
  ) {}

  private _setOAuthSessionCookie(
    reply: FastifyReply,
    session: OAuthSession,
  ): void {
    reply.cookie(OAUTH_SESSION_COOKIE_NAME, JSON.stringify(session), {
      httpOnly: true,
      signed: true,
      secure: this._cookieOptions.secure,
      sameSite: 'lax',
      path: OAUTH_SESSION_COOKIE_PATH,
      maxAge: OAUTH_SESSION_COOKIE_MAX_AGE,
    });
  }

  private _clearOAuthSessionCookie(reply: FastifyReply): void {
    reply.clearCookie(OAUTH_SESSION_COOKIE_NAME, {
      path: OAUTH_SESSION_COOKIE_PATH,
      sameSite: 'lax',
      secure: this._cookieOptions.secure,
    });
  }

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
  @SerializeOptions({ type: AuthResponseDto })
  async register(
    @Body() dto: AuthRegisterDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const tokens = await this._authService.register(dto);

    reply.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, this._cookieOptions);

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
  @SerializeOptions({ type: AuthResponseDto })
  async login(
    @Body() dto: AuthLoginDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const tokens = await this._authService.login(dto.email, dto.password);

    reply.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, this._cookieOptions);

    return { accessToken: tokens.accessToken };
  }

  @CsrfProtected()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 204, description: 'User successfully logged out' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @User() user: UserType,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    await this._authService.logout(user.id);

    reply.clearCookie(REFRESH_COOKIE_NAME, { path: this._cookieOptions.path });
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
  @SerializeOptions({ type: AuthResponseDto })
  async refresh(
    @User() user: UserType,
    @Cookie(REFRESH_COOKIE_NAME) refreshToken: string,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const tokens = await this._authService.refresh(user, refreshToken);

    reply.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, this._cookieOptions);

    return { accessToken: tokens.accessToken };
  }

  @Public()
  @Get('oauth/:provider')
  @Throttle(THROTTLE.auth.oauth)
  @ApiParam({ name: 'provider', enum: AuthProvider, enumName: 'AuthProvider' })
  @ApiQuery({
    name: 'redirect',
    required: false,
    description: 'Path to redirect after OAuth login',
    type: String,
  })
  @ApiOperation({ summary: 'Redirect to OAuth provider authorization page' })
  @ApiResponse({ status: 302, description: 'Redirect to provider' })
  @ApiResponse({ status: 400, description: 'Unsupported provider' })
  @ApiResponse({ status: 503, description: 'Provider not configured' })
  async oauthRedirect(
    @Param('provider', ParseAuthProviderPipe) provider: AuthProvider,
    @Query('redirect') redirect: string | undefined,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<void> {
    const { session, codeChallenge } = createOAuthSession(
      'login',
      undefined,
      redirect,
    );

    this._setOAuthSessionCookie(reply, session);

    const redirectUrl = this._oauthService.buildAuthUrl(
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
  @ApiParam({ name: 'provider', enum: AuthProvider, enumName: 'AuthProvider' })
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
  @ApiResponse({ status: 503, description: 'Provider not configured' })
  @SerializeOptions({ type: OAuthLinkInitResponseDto })
  async oauthLinkInit(
    @Param('provider', ParseAuthProviderPipe) provider: AuthProvider,
    @User() user: UserType,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<{ authUrl: string }> {
    const { session, codeChallenge } = createOAuthSession('link', user.id);

    this._setOAuthSessionCookie(reply, session);

    const authUrl = this._oauthService.buildAuthUrl(
      provider,
      session.state,
      codeChallenge,
    );

    return { authUrl };
  }

  @Public()
  @Get('oauth/:provider/callback')
  @Throttle(THROTTLE.auth.oauth)
  @ApiParam({ name: 'provider', enum: AuthProvider, enumName: 'AuthProvider' })
  @ApiQuery({ name: 'code', required: false, type: String })
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'error', required: false, type: String })
  @ApiOperation({ summary: 'OAuth callback — redirects to SPA after auth' })
  @ApiResponse({
    status: 302,
    description: 'Redirect to SPA /oauth/success or /oauth/error',
  })
  async oauthCallback(
    @Param('provider', ParseAuthProviderPipe) provider: AuthProvider,
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<void> {
    let session: OAuthSession;
    try {
      session = readOAuthSession(request);
    } catch {
      this._clearOAuthSessionCookie(reply);
      return reply.redirect(
        this._oauthService.buildErrorUrl('invalid_session'),
        HttpStatus.FOUND,
      );
    }

    if (session.state !== state) {
      this._clearOAuthSessionCookie(reply);
      return reply.redirect(
        this._oauthService.buildErrorUrl('invalid_state'),
        HttpStatus.FOUND,
      );
    }

    this._clearOAuthSessionCookie(reply);

    try {
      const { redirectUrl, refreshToken } =
        await this._oauthService.processCallback(
          provider,
          { code, error },
          session,
        );

      if (refreshToken) {
        reply.cookie(REFRESH_COOKIE_NAME, refreshToken, this._cookieOptions);
      }

      reply.redirect(redirectUrl, HttpStatus.FOUND);
    } catch (e) {
      const reason = this._oauthService.mapErrorToReason(e);
      if (reason === 'oauth_failed') {
        this._logger.error('Unexpected OAuth callback error', e);
      }
      reply.redirect(
        this._oauthService.buildErrorUrl(reason),
        HttpStatus.FOUND,
      );
    }
  }
}
