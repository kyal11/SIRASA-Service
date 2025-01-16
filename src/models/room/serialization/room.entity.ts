import { booking, slot } from '@prisma/client';
import { Expose, Type } from 'class-transformer';
import { SlotEntity } from 'src/models/slotRoom/serialization/slot.entity';

export class RoomEntity {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  floor: string;

  @Expose()
  startTime: string;

  @Expose()
  endTime: string;
  @Expose()
  @Type(() => SlotEntity)
  slots?: slot[];

  @Expose()
  bookings?: booking;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
