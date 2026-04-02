import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { KinopoiskGenreDto, KinopoiskCountryDto } from './kinopoisk-genre.dto';

export class KinopoiskFilmDto {
  @Expose()
  @ApiProperty()
  kinopoiskId: number;

  @Expose()
  @ApiProperty({ required: false })
  imdbId?: string;

  @Expose()
  @ApiProperty({ required: false })
  nameRu?: string;

  @Expose()
  @ApiProperty({ required: false })
  nameEn?: string;

  @Expose()
  @ApiProperty({ required: false })
  nameOriginal?: string;

  @Expose()
  @ApiProperty({ required: false })
  year?: number;

  @Expose()
  @ApiProperty({ required: false })
  ratingKinopoisk?: number;

  @Expose()
  @ApiProperty({ required: false })
  ratingImdb?: number;

  @Expose()
  @ApiProperty({ required: false })
  posterUrl?: string;

  @Expose()
  @ApiProperty({ required: false })
  posterUrlPreview?: string;

  @Expose()
  @ApiProperty({ required: false })
  description?: string;

  @Expose()
  @ApiProperty({ required: false })
  shortDescription?: string;

  @Expose()
  @ApiProperty({ required: false })
  filmLength?: number;

  @Expose()
  @ApiProperty({ required: false, type: [KinopoiskGenreDto] })
  genres?: KinopoiskGenreDto[];

  @Expose()
  @ApiProperty({ required: false, type: [KinopoiskCountryDto] })
  countries?: KinopoiskCountryDto[];
}
