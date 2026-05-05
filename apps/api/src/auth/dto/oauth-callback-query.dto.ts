import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class OAuthCallbackQueryDto {
  @ApiPropertyOptional({ description: 'Authorization code from provider' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ description: 'CSRF state parameter' })
  @IsString()
  state: string;

  @ApiPropertyOptional({
    description: 'Error from provider (e.g. access_denied)',
  })
  @IsOptional()
  @IsString()
  error?: string;
}
