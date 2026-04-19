import {
  IsOptional,
  IsEnum,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

import { GroupMovieStatus } from '$common/enums';

export class FindAllGroupMoviesDto {
  @ApiPropertyOptional({
    enum: GroupMovieStatus,
    description: 'Filter by movie status',
  })
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase())
  @IsEnum(GroupMovieStatus)
  status?: GroupMovieStatus;

  @ApiPropertyOptional({
    description: 'Search query for movie title',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  query?: string;
}
