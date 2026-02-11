import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';

import { Public } from '$common/decorators';

import { HealthResponseDto } from './dto/health-response.dto';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Health check',
    description: 'Check API service health status',
  })
  async health(): Promise<HealthResponseDto> {
    return await this.healthService.health();
  }
}
