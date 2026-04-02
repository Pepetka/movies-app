import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class InviteInfoResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty({ type: String, nullable: true })
  description: string | null;

  @Expose()
  @ApiProperty({ type: String, nullable: true })
  avatarUrl: string | null;

  @Expose()
  @ApiProperty()
  memberCount: number;
}
