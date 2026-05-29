import {
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';

import { HealthIndicatorResultDto, HealthResultDto } from './dto';
import { HealthService } from './health.service';

@ApiTags('health')
@ApiExtraModels(HealthIndicatorResultDto)
@Controller('health')
export class HealthController {
  constructor(private readonly _healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiResponse({
    status: 200,
    description: 'Application is alive',
    type: HealthResultDto,
  })
  @ApiResponse({ status: 503, description: 'Application is unhealthy' })
  async check(): Promise<HealthResultDto> {
    const result = await this._healthService.checkLiveness();
    if (result.status === 'error')
      throw new ServiceUnavailableException(result);
    return result;
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  @ApiResponse({
    status: 200,
    description: 'Application is ready to accept traffic',
    type: HealthResultDto,
  })
  @ApiResponse({ status: 503, description: 'Application is not ready' })
  async checkReady(): Promise<HealthResultDto> {
    const result = await this._healthService.checkReadiness();
    if (result.status === 'error')
      throw new ServiceUnavailableException(result);
    return result;
  }
}
