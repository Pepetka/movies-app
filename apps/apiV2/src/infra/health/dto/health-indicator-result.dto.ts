import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HealthIndicatorResultDto {
  @ApiProperty({ enum: ['up', 'down'], description: 'Indicator status' })
  status: 'up' | 'down';

  @ApiPropertyOptional({ description: 'Error message if status is down' })
  message?: string;

  @ApiPropertyOptional({
    description: 'Additional indicator details',
    type: 'object',
    additionalProperties: true,
  })
  details?: Record<string, unknown>;
}
