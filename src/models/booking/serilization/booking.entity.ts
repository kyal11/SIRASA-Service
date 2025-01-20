import { Expose, Type } from 'class-transformer';
import { RoomEntity } from 'src/models/room/serialization/room.entity';
import { UserEntity } from 'src/models/users/serialization/user.entity';
import { BookingSlotEntity } from './bookingSlot.entity';
import { statusBooking } from '@prisma/client';

export class BookingEntity {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  @Type(() => UserEntity)
  user: UserEntity;

  @Expose()
  roomId: string;

  @Expose()
  @Type(() => RoomEntity)
  room: RoomEntity;

  @Expose()
  @Type(() => BookingSlotEntity)
  slots: BookingSlotEntity[];

  @Expose()
  status: statusBooking;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
