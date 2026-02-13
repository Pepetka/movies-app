import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class TransferOwnershipDto {
  @ApiProperty({
    example: 123,
    description: 'User ID to transfer admin rights to',
  })
  @IsNumber()
  targetUserId: number;
}
