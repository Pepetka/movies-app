import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ProviderMovieSummary {
  @Expose()
  @ApiProperty({ type: String, nullable: true })
  imdbId: string | null;

  @Expose()
  @ApiProperty()
  externalId: string;

  @Expose()
  @ApiProperty()
  title: string;

  @Expose()
  @ApiProperty({ type: String, nullable: true })
  posterPath: string | null;

  @Expose()
  @ApiProperty()
  overview: string;

  @Expose()
  @ApiProperty({ type: Number, nullable: true })
  releaseYear: number | null;

  @Expose()
  @ApiProperty({ type: Number, nullable: true })
  rating: number | null;
}

export class ProviderSearchResult {
  @Expose()
  @ApiProperty()
  page: number;

  @Expose()
  @ApiProperty()
  totalPages: number;

  @Expose()
  @ApiProperty()
  totalResults: number;

  @Expose()
  @ApiProperty({ type: [ProviderMovieSummary] })
  results: ProviderMovieSummary[];
}

export class ProviderMovieDetails {
  @Expose()
  @ApiProperty({ type: String, nullable: true })
  imdbId?: string;

  @Expose()
  @ApiProperty()
  externalId: string;

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
  @ApiProperty({ type: Number, nullable: true })
  rating: number | null;

  @Expose()
  @ApiProperty({ type: [String] })
  genres: string[];

  @Expose()
  @ApiProperty({ type: Number, nullable: true })
  runtime: number | null;
}
