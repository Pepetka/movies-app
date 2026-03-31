import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class KinopoiskGenreDto {
  @Expose()
  @ApiProperty()
  genre: string;
}

export class KinopoiskCountryDto {
  @Expose()
  @ApiProperty()
  country: string;
}
