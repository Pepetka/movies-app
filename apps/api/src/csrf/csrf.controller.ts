import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { FastifyReply } from 'fastify';

import { Public } from '$common/decorators';
import { THROTTLE } from '$common/configs';

import { CsrfResponseDto } from './dto';

@ApiTags('csrf')
@Controller('csrf')
export class CsrfController {
  @Public()
  @Get('token')
  @HttpCode(HttpStatus.OK)
  @Throttle(THROTTLE.csrf)
  @ApiOperation({ summary: 'Get CSRF token' })
  @ApiResponse({ status: 200, type: CsrfResponseDto })
  getToken(@Res({ passthrough: true }) reply: FastifyReply): CsrfResponseDto {
    return { token: reply.generateCsrf() };
  }
}
