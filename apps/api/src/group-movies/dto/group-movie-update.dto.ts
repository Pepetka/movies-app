import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsValidMovieStatus } from '$common/validators';

import { GroupMovieStatus } from './group-movie-response.dto';

export class GroupMovieUpdateDto {
  @ApiPropertyOptional({
    description: 'Movie status in group',
    enum: GroupMovieStatus,
  })
  @IsOptional()
  @IsEnum(GroupMovieStatus)
  status?: GroupMovieStatus;

  @ApiPropertyOptional({
    description: 'Planned watch date',
    example: '2024-12-31T20:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  plannedDate?: string;

  @ApiPropertyOptional({
    description: 'Watched date',
    example: '2024-12-25T20:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  watchedDate?: string;

  @IsValidMovieStatus()
  validateStatus?() {}
}
