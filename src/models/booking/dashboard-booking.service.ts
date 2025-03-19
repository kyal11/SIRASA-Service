import { Injectable } from '@nestjs/common';
import { ApiResponse } from 'src/common/api-response.entity';
import { PrismaService } from 'src/config/prisma/prisma.service';

@Injectable()
export class DashboardBookingService {
  constructor(private readonly prisma: PrismaService) {}

  async countBooking(dayFilter: number): Promise<
    ApiResponse<{
      totalBookings: number;
      canceledBookings: number;
      bookedBookings: number;
      doneBookings: number;
      totalRooms: number;
    }>
  > {
    let dateFilter = {};

    if ([1, 2, 3].includes(dayFilter)) {
      const now = new Date();
      const startDate = new Date(now);
      const endDate = new Date(now);

      if (dayFilter === 1) {
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
      } else if (dayFilter === 2) {
        startDate.setDate(now.getDate() + 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(now.getDate() + 1);
        endDate.setHours(23, 59, 59, 999);
      } else if (dayFilter === 3) {
        startDate.setDate(now.getDate() + 2);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(now.getDate() + 2);
        endDate.setHours(23, 59, 59, 999);
      }

      dateFilter = {
        createdAt: {
          gte: startDate.toISOString(),
          lte: endDate.toISOString(),
        },
      };
    }

    const bookings = await this.prisma.bookings.findMany({
      include: {
        bookingSlot: {
          include: {
            slot: true,
          },
        },
      },
      where: {
        bookingSlot: {
          some: {
            slot: {
              ...dateFilter, // Menggunakan createdAt dari slot
            },
          },
        },
      },
    });

    const totalBookings = bookings.length;
    const canceledBookings = bookings.filter(
      (b) => b.status === 'cancel',
    ).length;
    const bookedBookings = bookings.filter((b) => b.status === 'booked').length;
    const doneBookings = bookings.filter((b) => b.status === 'done').length;
    const totalRooms = await this.prisma.rooms.count();

    return new ApiResponse<{
      totalBookings: number;
      canceledBookings: number;
      bookedBookings: number;
      doneBookings: number;
      totalRooms: number;
    }>('success', 'Booking data retrieved successfully', {
      totalBookings,
      canceledBookings,
      bookedBookings,
      doneBookings,
      totalRooms,
    });
  }
}
