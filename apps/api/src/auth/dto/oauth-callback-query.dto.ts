import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class OAuthCallbackQueryDto {
  @ApiPropertyOptional({ description: 'Authorization code from provider' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'CSRF state parameter' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    description: 'Error from provider (e.g. access_denied)',
  })
  @IsOptional()
  @IsString()
  error?: string;
}
