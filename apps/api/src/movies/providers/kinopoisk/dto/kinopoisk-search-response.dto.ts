import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { KinopoiskFilmDto } from './kinopoisk-film.dto';

export class KinopoiskSearchResponseDto {
  @Expose()
  @ApiProperty()
  total: number;

  @Expose()
  @ApiProperty()
  totalPages: number;

  @Expose()
  @ApiProperty({ type: [KinopoiskFilmDto] })
  items: KinopoiskFilmDto[];
}
