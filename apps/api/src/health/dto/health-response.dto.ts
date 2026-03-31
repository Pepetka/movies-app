import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export enum HealthStatus {
  OK = 'ok',
  DEGRADED = 'degraded',
}

export enum DatabaseStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
}

export class HealthResponseDto {
  @Expose()
  @ApiProperty({ enum: HealthStatus })
  @IsEnum(HealthStatus)
  @IsNotEmpty()
  status: string;

  @Expose()
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  timestamp: number;

  @Expose()
  @ApiProperty({ enum: DatabaseStatus })
  @IsEnum(DatabaseStatus)
  @IsNotEmpty()
  database: string;

  @Expose()
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  error?: string;
}
