import { Expose, Type } from 'class-transformer';

class UserSummary {
  @Expose() total: number;
  @Expose() totalRoleUser: number;
  @Expose() totalRoleAdmin: number;
  @Expose() totalRoleSuperadmin: number;
}

class RoomData {
  @Expose() id: number;
  @Expose() name: string;
  @Expose() type: string;
  @Expose() price: number;
}

class RoomSummary {
  @Expose() totalRooms: number;
  @Expose() @Type(() => RoomData) dataRooms: RoomData[];
}

class BookingSummary {
  @Expose() totalBooking: number;
  @Expose() totalDone: number;
  @Expose() totalBooked: number;
  @Expose() totalCancel: number;
}

export class DataSummary {
  @Expose() @Type(() => UserSummary) user: UserSummary;
  @Expose() @Type(() => RoomSummary) rooms: RoomSummary;
  @Expose() @Type(() => BookingSummary) booking: BookingSummary;
}
