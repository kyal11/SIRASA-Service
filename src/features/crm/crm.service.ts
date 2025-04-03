import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { DataSummary } from './serilization/data-summary';
@Injectable()
export class CrmService {
  constructor(private readonly prisma: PrismaService) {}

  async dataSummary(): Promise<DataSummary> {
    const totalUsers = await this.prisma.users.count();
    const rolesCount = await this.prisma.users.groupBy({
      by: ['role'],
      _count: { role: true },
    });

    const totalRooms = await this.prisma.rooms.count({
      where: {
        deletedAt: null,
      },
    });
    const dataRooms = await this.prisma.rooms.findMany();
    const totalBookings = await this.prisma.bookings.count();
    const bookingStatusCount = await this.prisma.bookings.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const summary = {
      user: {
        total: totalUsers,
        totalRoleUser:
          rolesCount.find((r) => r.role === 'user')?._count.role || 0,
        totalRoleAdmin:
          rolesCount.find((r) => r.role === 'admin')?._count.role || 0,
        totalRoleSuperadmin:
          rolesCount.find((r) => r.role === 'superadmin')?._count.role || 0,
      },
      rooms: {
        totalRooms,
        dataRooms,
      },
      booking: {
        totalBooking: totalBookings,
        totalDone:
          bookingStatusCount.find((b) => b.status === 'done')?._count.status ||
          0,
        totalBooked:
          bookingStatusCount.find((b) => b.status === 'booked')?._count
            .status || 0,
        totalCancel:
          bookingStatusCount.find((b) => b.status === 'cancel')?._count
            .status || 0,
      },
    };

    return plainToInstance(DataSummary, summary);
  }
}
