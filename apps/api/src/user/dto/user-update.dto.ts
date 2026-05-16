import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UserUpdateDto {
  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name?: string;

  @ApiProperty({
    type: String,
    example: 'https://example.com/avatar.jpg',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsUrl(
    { protocols: ['http', 'https'] },
    { message: 'Avatar must be a valid URL' },
  )
  @MaxLength(512)
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed || null;
  })
  avatar?: string | null;
}
