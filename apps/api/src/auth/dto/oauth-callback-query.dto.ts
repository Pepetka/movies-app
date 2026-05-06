import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class OAuthCallbackQueryDto {
  @ApiPropertyOptional({ description: 'Authorization code from provider' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ description: 'CSRF state parameter' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiPropertyOptional({
    description: 'Error from provider (e.g. access_denied)',
  })
  @IsOptional()
  @IsString()
  error?: string;
}
