import { Expose, Type } from 'class-transformer';
import { BookingEntity } from './booking.entity';
import { SlotEntity } from 'src/models/slotRoom/serialization/slot.entity';

export class BookingSlotEntity {
  @Expose()
  id: string;

  @Expose()
  bookingId: string;

  @Expose()
  @Type(() => BookingEntity)
  booking: BookingEntity;

  @Expose()
  slotId: string;

  @Expose()
  @Type(() => SlotEntity)
  slot: SlotEntity;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
