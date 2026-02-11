import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class MovieSearchGroupDto {
  @ApiProperty({ description: 'Search query', example: 'матрица' })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    description: 'Page number (for provider results)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;
}
