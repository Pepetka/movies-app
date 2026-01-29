import { Controller, Get } from '@nestjs/common';

import { HealthResponseDto } from './dto/health-response.dto';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async health(): Promise<HealthResponseDto> {
    return await this.healthService.health();
  }
}
