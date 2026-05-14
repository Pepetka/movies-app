import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { ReviewResponseDto } from './review-response.dto';

export class ReviewListResponseDto {
  @Expose()
  @ApiProperty({ type: [ReviewResponseDto] })
  @Type(() => ReviewResponseDto)
  items: ReviewResponseDto[];

  @Expose()
  @Type(() => Number)
  @ApiProperty({ type: Number, nullable: true })
  averageRating: number | null;

  @Expose()
  @Type(() => Number)
  @ApiProperty()
  totalCount: number;
}
