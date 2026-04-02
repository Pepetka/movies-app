import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class MovieResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  externalId: string;

  @Expose()
  @ApiProperty({ type: String, nullable: true })
  imdbId: string | null;

  @Expose()
  @ApiProperty()
  title: string;

  @Expose()
  @ApiProperty({ type: String, nullable: true })
  posterPath: string | null;

  @Expose()
  @ApiProperty({ type: String, nullable: true })
  overview: string | null;

  @Expose()
  @ApiProperty({ type: Number, nullable: true })
  releaseYear: number | null;

  @Expose()
  @ApiProperty({ type: String, nullable: true })
  rating: string | null;

  @Expose()
  @ApiProperty({ type: [String], nullable: true })
  genres: string[] | null;

  @Expose()
  @ApiProperty({ type: Number, nullable: true })
  runtime: number | null;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
