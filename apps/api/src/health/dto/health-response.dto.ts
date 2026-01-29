import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum HealthStatus {
  OK = 'ok',
  DEGRADED = 'degraded',
}

export enum DatabaseStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
}

export class HealthResponseDto {
  @ApiProperty({ enum: HealthStatus })
  @IsEnum(HealthStatus)
  @IsNotEmpty()
  status: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  timestamp: number;

  @ApiProperty({ enum: DatabaseStatus })
  @IsEnum(DatabaseStatus)
  @IsNotEmpty()
  database: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  error?: string;
}
