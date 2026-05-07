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
  UseFilters,
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
  AuthLoginDto,
  AuthRegisterDto,
  AuthResponseDto,
  OAuthLinkInitResponseDto,
  OAuthRedirectQueryDto,
} from './dto';
import {
  REFRESH_COOKIE_OPTIONS,
  REFRESH_COOKIE_NAME,
  RefreshCookieOptions,
} from './auth.constants';
import { ParseAuthProviderPipe } from './oauth/pipes/parse-auth-provider.pipe';
import { createOAuthSession } from './oauth/utils/create-oauth-session.util';
import { OAuthRedirectExceptionFilter } from './oauth/oauth-redirect.filter';
import { OAuthCookieService } from './oauth/oauth-cookie.service';
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
    private readonly _cookieService: OAuthCookieService,
    @Inject(REFRESH_COOKIE_OPTIONS)
    private readonly _cookieOptions: RefreshCookieOptions,
  ) {}

  @Public()
  @Post('register')
  @Throttle(THROTTLE.auth.critical)
  @ApiOperation({ summary: 'Register a new user', security: [] })
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
  @ApiOperation({ summary: 'Login user', security: [] })
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
  @ApiOperation({ summary: 'Refresh access token', security: [] })
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
  @ApiOperation({
    summary: 'Redirect to OAuth provider authorization page',
    security: [],
  })
  @ApiResponse({ status: 302, description: 'Redirect to provider' })
  @ApiResponse({ status: 400, description: 'Unsupported provider' })
  @ApiResponse({ status: 503, description: 'Provider not configured' })
  async oauthRedirect(
    @Param('provider', ParseAuthProviderPipe) provider: AuthProvider,
    @Query() query: OAuthRedirectQueryDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<void> {
    const { session, codeChallenge } = createOAuthSession(
      'login',
      undefined,
      query.redirect,
    );

    this._cookieService.setOAuthSessionCookie(reply, session);

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
  ): Promise<OAuthLinkInitResponseDto> {
    const { session, codeChallenge } = createOAuthSession('link', user.id);

    this._cookieService.setOAuthSessionCookie(reply, session);

    const authUrl = this._oauthService.buildAuthUrl(
      provider,
      session.state,
      codeChallenge,
    );

    return Object.assign(new OAuthLinkInitResponseDto(), { authUrl });
  }

  @Public()
  @UseFilters(OAuthRedirectExceptionFilter)
  @Get('oauth/:provider/callback')
  @Throttle(THROTTLE.auth.oauth)
  @ApiParam({ name: 'provider', enum: AuthProvider, enumName: 'AuthProvider' })
  @ApiQuery({ name: 'code', required: false, type: String })
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'error', required: false, type: String })
  @ApiOperation({
    summary: 'OAuth callback — redirects to SPA after auth',
    security: [],
  })
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
      session = this._cookieService.readOAuthSession(request);
    } catch {
      this._logger.warn(
        'OAuth callback rejected: invalid or missing session cookie',
      );
      this._cookieService.clearOAuthSessionCookie(reply);
      return reply.redirect(
        this._oauthService.buildErrorUrl('invalid_session'),
        HttpStatus.FOUND,
      );
    }

    if (session.state !== state) {
      this._logger.warn('OAuth callback rejected: state mismatch');
      this._cookieService.clearOAuthSessionCookie(reply);
      return reply.redirect(
        this._oauthService.buildErrorUrl('invalid_state'),
        HttpStatus.FOUND,
      );
    }

    this._cookieService.clearOAuthSessionCookie(reply);

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
  }
}
