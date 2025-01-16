import { room } from '@prisma/client';
import { Expose, Type } from 'class-transformer';
import { BookingSlotEntity } from 'src/models/booking/serilization/bookingSlot.entity';

export class SlotEntity {
  @Expose()
  id: string;

  @Expose()
  roomId: string;

  @Expose()
  room?: room;

  @Expose()
  date: Date;

  @Expose()
  startTime: string;

  @Expose()
  endTime: string;

  @Expose()
  isBooked: boolean;

  @Expose()
  bookingId?: string;

  @Expose()
  @Type(() => BookingSlotEntity)
  bookings?: BookingSlotEntity[];

  @Expose()
  isExpired: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
