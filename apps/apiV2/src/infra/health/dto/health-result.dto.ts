import { ApiProperty, getSchemaPath } from '@nestjs/swagger';

import { HealthIndicatorResultDto } from './health-indicator-result.dto';

export class HealthResultDto {
  @ApiProperty({ enum: ['ok', 'error'], description: 'Overall health status' })
  status: 'ok' | 'error';

  @ApiProperty({
    description: 'Healthy indicators',
    type: 'object',
    additionalProperties: { $ref: getSchemaPath(HealthIndicatorResultDto) },
  })
  info: Record<string, HealthIndicatorResultDto>;

  @ApiProperty({
    description: 'Unhealthy indicators',
    type: 'object',
    additionalProperties: { $ref: getSchemaPath(HealthIndicatorResultDto) },
  })
  error: Record<string, HealthIndicatorResultDto>;

  @ApiProperty({
    description: 'All indicators',
    type: 'object',
    additionalProperties: { $ref: getSchemaPath(HealthIndicatorResultDto) },
  })
  details: Record<string, HealthIndicatorResultDto>;
}
