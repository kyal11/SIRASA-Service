import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateBookingDto {
  @IsString()
  @IsOptional()
  userId: string;

  @IsString()
  @IsOptional()
  roomId: string;

  @IsArray()
  @IsOptional()
  bookingSlotId: string[];
}
