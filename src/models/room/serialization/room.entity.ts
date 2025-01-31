import { bookings } from '@prisma/client';
import { Expose, Type } from 'class-transformer';
import { SlotEntity } from 'src/models/slotRoom/serialization/slot.entity';

export class RoomEntity {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  floor: number;

  @Expose()
  capacity: number;

  @Expose()
  startTime: string;

  @Expose()
  endTime: string;

  @Expose()
  @Type(() => SlotEntity)
  slots?: SlotEntity[];

  @Expose()
  bookings?: bookings;

  // @Expose()
  createdAt: Date;

  // @Expose()
  updatedAt: Date;
}
