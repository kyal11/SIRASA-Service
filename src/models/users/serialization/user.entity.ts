import { Exclude, Expose, Type } from 'class-transformer';
import { BookingEntity } from 'src/models/booking/serilization/booking.entity';

export class UserEntity {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Exclude()
  password: string;

  @Expose()
  nim: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  verified: boolean;

  @Expose()
  role: string;

  @Expose()
  imageUrl?: string;

  @Expose()
  @Type(() => BookingEntity)
  bookings: BookingEntity;
  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
