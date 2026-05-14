import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

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
  @ApiProperty({ type: Boolean, required: false })
  isOwn?: boolean;
}
