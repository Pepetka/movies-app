import { IsNotEmpty, IsString, IsIn, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import {
  ALLOWED_REACTIONS,
  type AllowedReaction,
} from '../constants/reactions';

export class CreateReviewReactionDto {
  @ApiProperty({
    description: 'Emoji reaction',
    example: '👍',
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  @IsIn(ALLOWED_REACTIONS)
  emoji: AllowedReaction;
}
