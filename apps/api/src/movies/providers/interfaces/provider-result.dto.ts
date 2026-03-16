import { ApiProperty } from '@nestjs/swagger';

export class ProviderMovieSummary {
  @ApiProperty({ type: String, nullable: true })
  imdbId: string | null;

  @ApiProperty()
  externalId: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ type: String, nullable: true })
  posterPath: string | null;

  @ApiProperty()
  overview: string;

  @ApiProperty({ type: Number, nullable: true })
  releaseYear: number | null;

  @ApiProperty()
  rating: number;
}

export class ProviderSearchResult {
  @ApiProperty()
  page: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  totalResults: number;

  @ApiProperty({ type: [ProviderMovieSummary] })
  results: ProviderMovieSummary[];
}

export class ProviderMovieDetails {
  @ApiProperty({ type: String, nullable: true })
  imdbId?: string;

  @ApiProperty()
  externalId: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ type: String, nullable: true })
  posterPath: string | null;

  @ApiProperty({ type: String, nullable: true })
  overview: string | null;

  @ApiProperty({ type: Number, nullable: true })
  releaseYear: number | null;

  @ApiProperty()
  rating: number;

  @ApiProperty({ type: [String] })
  genres: string[];

  @ApiProperty({ type: Number, nullable: true })
  runtime: number | null;
}
