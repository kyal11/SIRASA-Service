import { bookingSlot, room } from '@prisma/client';
import { Expose, Type } from 'class-transformer';
import { BookingEntity } from 'src/models/booking/serilization/booking.entity';

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
  @Type(() => BookingEntity)
  bookings?: bookingSlot;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
