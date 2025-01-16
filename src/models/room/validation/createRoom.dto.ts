import { slot } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  floor: number;

  @IsString()
  @IsNotEmpty()
  capacity: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime must be in the format HH:mm (e.g., 00:00)',
  })
  startTime: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime must be in the format HH:mm (e.g., 00:00)',
  })
  endTime: string;

  @IsString()
  @IsOptional()
  slots?: slot[];
}
