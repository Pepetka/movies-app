import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { ReviewReactionResponseDto } from './review-reaction-response.dto';

export class ReviewResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  groupMovieId: number;

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
  @Type(() => Number)
  @ApiProperty({ type: Number })
  rating: number;

  @Expose()
  @ApiProperty({ type: String, nullable: true })
  text: string | null;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Expose()
  @ApiProperty({ type: Boolean })
  isOwn: boolean;

  @Expose()
  @Type(() => ReviewReactionResponseDto)
  @ApiProperty({ type: [ReviewReactionResponseDto] })
  reactions: ReviewReactionResponseDto[];
}
