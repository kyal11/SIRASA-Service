import { Expose, Type } from 'class-transformer';
import { RoomEntity } from 'src/models/room/serialization/room.entity';
import { SlotEntity } from 'src/models/slotRoom/serialization/slot.entity';
import { UserEntity } from 'src/models/users/serialization/user.entity';

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
  @Type(() => SlotEntity)
  slots: SlotEntity[];

  @Expose()
  duration: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
