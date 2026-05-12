import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { IsValidReviewRating, AtLeastOneOfClass } from '$common/validators';

@AtLeastOneOfClass(['rating', 'text'], {
  message: 'At least one of rating or text must be provided',
})
export class UpdateReviewDto {
  @ApiPropertyOptional({
    description: 'Rating 0.5–5.0, step 0.5',
    minimum: 0.5,
    maximum: 5.0,
  })
  @Type(() => Number)
  @IsOptional()
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
