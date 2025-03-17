import { Expose, Type } from 'class-transformer';
import { RoomEntity } from 'src/models/room/serialization/room.entity';
import { UserEntity } from 'src/models/users/serialization/user.entity';
import { BookingSlotEntity } from './booking-slot.entity';
import { statusBooking } from '@prisma/client';

export class BookingEntity {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  userName: string;

  @Expose()
  userNim: string;

  @Expose()
  phoneNumber: string;

  // @Expose()
  @Type(() => UserEntity)
  user: UserEntity;

  @Expose()
  roomId: string;

  // @Expose()
  @Type(() => RoomEntity)
  room: RoomEntity;

  @Expose()
  roomName: string;

  @Expose()
  roomCapacity: number;

  @Expose()
  roomFloor: number;

  @Expose()
  participant: number;

  @Expose()
  status: statusBooking;

  @Expose()
  description: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => BookingSlotEntity)
  slots: BookingSlotEntity[];
}
