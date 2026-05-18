import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ReviewReactionResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  reviewId: number;

  @Expose()
  @ApiProperty()
  userId: number;

  @Expose()
  @ApiProperty({ type: String })
  userName: string;

  @Expose()
  @ApiProperty({ type: String, nullable: true })
  userAvatar: string | null;

  @Expose()
  @ApiProperty()
  emoji: string;

  @Expose()
  @ApiProperty({ type: Boolean })
  isOwn: boolean;

  @Expose()
  @ApiProperty()
  createdAt: Date;
}
