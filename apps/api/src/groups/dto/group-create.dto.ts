import { IsString, IsOptional, MaxLength, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GroupCreateDto {
  @ApiProperty({ example: 'Movie Club', description: 'Group name' })
  @IsString()
  @MaxLength(256)
  name: string;

  @ApiPropertyOptional({
    example: 'Weekly movie nights',
    description: 'Group description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'Group avatar URL',
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(512)
  avatarUrl?: string;
}
