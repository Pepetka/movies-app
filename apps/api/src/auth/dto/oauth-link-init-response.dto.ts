import { ApiProperty } from '@nestjs/swagger';

export class OAuthLinkInitResponseDto {
  @ApiProperty({ description: 'OAuth provider authorization URL' })
  authUrl: string;
}
