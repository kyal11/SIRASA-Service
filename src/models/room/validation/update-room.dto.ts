import { slots } from '@prisma/client';
import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateRoomDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  floor: number;

  @IsString()
  @IsOptional()
  capacity: number;

  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime must be in the format HH:mm (e.g., 00:00)',
  })
  startTime: string;

  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime must be in the format HH:mm (e.g., 00:00)',
  })
  endTime: string;

  @IsString()
  @IsOptional()
  slots?: slots[];
}
