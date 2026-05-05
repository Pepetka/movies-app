import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class OAuthLinkInitResponseDto {
  @ApiProperty({ description: 'OAuth provider authorization URL' })
  @Expose()
  authUrl: string;
}
