import { ApiProperty } from '@nestjs/swagger';

export class GroupResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: String, nullable: true })
  description: string | null;

  @ApiProperty({ type: String, nullable: true })
  avatarUrl: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
