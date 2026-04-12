import { IsString, IsOptional, MaxLength, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GroupCreateDto {
  @ApiProperty({ example: 'Movie Club', description: 'Group name' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'Weekly movie nights',
    description: 'Group description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Group avatar URL',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(512)
  avatarUrl?: string;
}
