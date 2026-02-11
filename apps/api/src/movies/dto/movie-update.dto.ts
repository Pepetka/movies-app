import {
  IsOptional,
  IsString,
  MaxLength,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MovieUpdateDto {
  @ApiProperty({ description: 'Movie title', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiProperty({ description: 'Poster path', required: false })
  @IsOptional()
  @IsString()
  posterPath?: string;

  @ApiProperty({ description: 'Movie overview', required: false })
  @IsOptional()
  @IsString()
  overview?: string;

  @ApiProperty({
    description: 'Release year',
    required: false,
    example: 1999,
  })
  @IsOptional()
  @IsNumber()
  @Min(1800)
  @Max(2100)
  releaseYear?: number;

  @ApiProperty({
    description: 'Rating (0-10)',
    required: false,
    minimum: 0,
    maximum: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  rating?: number;

  @ApiProperty({ description: 'Runtime in minutes', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  runtime?: number;
}
