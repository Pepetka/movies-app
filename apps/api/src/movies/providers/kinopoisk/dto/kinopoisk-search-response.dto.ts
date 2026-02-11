import { ApiProperty } from '@nestjs/swagger';

import { KinopoiskFilmDto } from './kinopoisk-film.dto';

export class KinopoiskSearchResponseDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty({ type: [KinopoiskFilmDto] })
  items: KinopoiskFilmDto[];
}
