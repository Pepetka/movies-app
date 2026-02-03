import {
  Controller,
  Post,
  Body,
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
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { FastifyReply } from 'fastify';

import { CsrfProtected, Public, User } from '$common/decorators';
import { Cookie } from '$common/decorators/cookie.decorator';
import type { User as UserType } from '$db/schemas';
import { THROTTLE } from '$common/configs';

import {
  REFRESH_COOKIE_OPTIONS,
  REFRESH_COOKIE_NAME,
  RefreshCookieOptions,
} from './auth.constants';
import { AuthLoginDto, AuthRegisterDto, AuthResponseDto } from './dto';
import { RefreshGuard } from './guards/refresh.guard';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
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
    const tokens = await this.authService.refresh(user.id, refreshToken);

    reply.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, this.cookieOptions);

    return { accessToken: tokens.accessToken };
  }
}
