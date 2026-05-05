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

  @ApiPropertyOptional({ description: 'Issuer identifier (Google-specific)' })
  @IsOptional()
  @IsString()
  iss?: string;

  @ApiPropertyOptional({ description: 'Granted scopes (Google-specific)' })
  @IsOptional()
  @IsString()
  scope?: string;

  @ApiPropertyOptional({ description: 'Auth user index (Google-specific)' })
  @IsOptional()
  @IsString()
  authuser?: string;

  @ApiPropertyOptional({ description: 'Prompt type (Google-specific)' })
  @IsOptional()
  @IsString()
  prompt?: string;
}
