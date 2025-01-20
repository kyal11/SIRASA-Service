import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsString()
  @IsNotEmpty()
  bookingSlotId: string[];
}
