import { ApiProperty } from '@nestjs/swagger';

export class ProviderMovieSummary {
  @ApiProperty()
  imdbId: string | null;

  @ApiProperty()
  externalId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  posterPath: string | null;

  @ApiProperty()
  overview: string;

  @ApiProperty()
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
  @ApiProperty({ required: false })
  imdbId?: string;

  @ApiProperty()
  externalId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  posterPath: string | null;

  @ApiProperty()
  overview: string | null;

  @ApiProperty()
  releaseYear: number | null;

  @ApiProperty()
  rating: number;

  @ApiProperty({ type: [String] })
  genres: string[];

  @ApiProperty()
  runtime: number | null;
}
