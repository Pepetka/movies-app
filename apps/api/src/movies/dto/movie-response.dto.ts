import { ApiProperty } from '@nestjs/swagger';

export class MovieResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  externalId: string;

  @ApiProperty({ type: String, nullable: true })
  imdbId: string | null;

  @ApiProperty()
  title: string;

  @ApiProperty({ type: String, nullable: true })
  posterPath: string | null;

  @ApiProperty({ type: String, nullable: true })
  overview: string | null;

  @ApiProperty({ type: Number, nullable: true })
  releaseYear: number | null;

  @ApiProperty({ type: String, nullable: true })
  rating: string | null;

  @ApiProperty({ type: [String], nullable: true })
  genres: string[] | null;

  @ApiProperty({ type: Number, nullable: true })
  runtime: number | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
