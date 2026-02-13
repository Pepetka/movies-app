import { ApiProperty } from '@nestjs/swagger';

export class MovieResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  externalId: string;

  @ApiProperty({ required: false })
  imdbId?: string | null;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  posterPath?: string;

  @ApiProperty({ required: false })
  overview?: string;

  @ApiProperty({ required: false })
  releaseYear?: number;

  @ApiProperty({ required: false })
  rating?: string;

  @ApiProperty({ required: false, type: [String] })
  genres?: string[];

  @ApiProperty({ required: false })
  runtime?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
