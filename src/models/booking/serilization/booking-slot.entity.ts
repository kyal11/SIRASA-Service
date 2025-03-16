import { Expose, Type } from 'class-transformer';
import { BookingEntity } from './booking.entity';
import { SlotEntity } from 'src/models/slotRoom/serialization/slot.entity';

export class BookingSlotEntity {
  @Expose()
  id: string;

  bookingId: string;

  @Type(() => BookingEntity)
  booking: BookingEntity;

  @Expose()
  slotId: string;

  @Expose()
  startTime: string;

  @Expose()
  endTime: string;

  @Type(() => SlotEntity)
  slot: SlotEntity;

  @Expose()
  createdAt: Date;

  updatedAt: Date;
}
