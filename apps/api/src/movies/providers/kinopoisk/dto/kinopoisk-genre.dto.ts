import { ApiProperty } from '@nestjs/swagger';

export class KinopoiskGenreDto {
  @ApiProperty()
  genre: string;
}

export class KinopoiskCountryDto {
  @ApiProperty()
  country: string;
}
