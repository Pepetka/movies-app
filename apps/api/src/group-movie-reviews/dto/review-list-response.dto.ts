import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { ReviewResponseDto } from './review-response.dto';

export class ReviewListResponseDto {
  @Expose()
  @ApiProperty({ type: [ReviewResponseDto] })
  @Type(() => ReviewResponseDto)
  items: ReviewResponseDto[];

  @Expose()
  @ApiProperty({ type: Number, nullable: true })
  averageRating: number | null;

  @Expose()
  @ApiProperty()
  totalCount: number;
}
