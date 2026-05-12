import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

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
  @ApiProperty({ type: String, nullable: true })
  userName: string | null;

  @Expose()
  @ApiProperty()
  rating: string;

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
  @ApiProperty({ type: Boolean, required: false })
  isOwn?: boolean;
}
