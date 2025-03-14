import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBookingDto {
  // @IsString()
  // @IsNotEmpty()
  // userId: string;

  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsArray()
  @IsNotEmpty()
  bookingSlotId: string[];

  @IsNumber()
  @IsNotEmpty()
  participant: number;

  @IsString()
  @IsOptional()
  description?: string;
}
