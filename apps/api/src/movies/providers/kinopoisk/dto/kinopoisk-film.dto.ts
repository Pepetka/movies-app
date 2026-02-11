import { ApiProperty } from '@nestjs/swagger';

import { KinopoiskGenreDto, KinopoiskCountryDto } from './kinopoisk-genre.dto';

export class KinopoiskFilmDto {
  @ApiProperty()
  kinopoiskId: number;

  @ApiProperty({ required: false })
  imdbId?: string;

  @ApiProperty({ required: false })
  nameRu?: string;

  @ApiProperty({ required: false })
  nameEn?: string;

  @ApiProperty({ required: false })
  nameOriginal?: string;

  @ApiProperty({ required: false })
  year?: number;

  @ApiProperty({ required: false })
  ratingKinopoisk?: number;

  @ApiProperty({ required: false })
  ratingImdb?: number;

  @ApiProperty({ required: false })
  posterUrl?: string;

  @ApiProperty({ required: false })
  posterUrlPreview?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  shortDescription?: string;

  @ApiProperty({ required: false })
  filmLength?: number;

  @ApiProperty({ required: false, type: [KinopoiskGenreDto] })
  genres?: KinopoiskGenreDto[];

  @ApiProperty({ required: false, type: [KinopoiskCountryDto] })
  countries?: KinopoiskCountryDto[];
}
