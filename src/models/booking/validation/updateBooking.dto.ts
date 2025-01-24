import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

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

  @IsNumber()
  @IsOptional()
  pasticipant: number;
}
