import { ApiProperty } from '@nestjs/swagger';

export class InviteInfoResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: String, nullable: true })
  description: string | null;

  @ApiProperty({ type: String, nullable: true })
  avatarUrl: string | null;

  @ApiProperty()
  memberCount: number;
}
