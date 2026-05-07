import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class OAuthRedirectQueryDto {
  @ApiPropertyOptional({
    description: 'Path to redirect after OAuth login',
    type: String,
  })
  @IsOptional()
  @IsString()
  redirect?: string;
}
