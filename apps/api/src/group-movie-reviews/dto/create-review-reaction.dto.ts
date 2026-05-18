import { IsNotEmpty, IsString, MaxLength, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { ALLOWED_REACTIONS } from '../constants/reactions';

export class CreateReviewReactionDto {
  @ApiProperty({
    description: 'Emoji reaction',
    example: '👍',
    maxLength: 10,
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(ALLOWED_REACTIONS)
  @MaxLength(10)
  emoji: string;
}
