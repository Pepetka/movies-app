import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { IsValidReviewRating, ValidateUpdateReview } from '$common/validators';

export class UpdateReviewDto {
  @ApiPropertyOptional({
    description: 'Rating 0.5–5.0, step 0.5',
    minimum: 0.5,
    maximum: 5.0,
  })
  @ValidateUpdateReview()
  @Type(() => Number)
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  @IsValidReviewRating()
  rating?: number;

  @ApiPropertyOptional({
    description: 'Review text',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  text?: string;
}
