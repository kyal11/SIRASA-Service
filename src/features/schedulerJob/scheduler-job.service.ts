import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SchedulerJobService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationsService,
  ) {}

  @Cron('0/5 * * * * *')
  async handleBookingReminder(): Promise<void> {
    const nowDate = new Date();
    const tenMinutesLater = new Date(nowDate.getTime() + 10 * 60 * 1000);
    const formattedTime = this.formatTime(tenMinutesLater);
    const startOfDay = new Date(nowDate.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(nowDate.setHours(23, 59, 59, 999)).toISOString();
    console.log(
      `Checking bookings for reminders at ${startOfDay}- ${endOfDay} in ${formattedTime}...`,
    );

    const bookings = await this.prisma.bookings.findMany({
      where: {
        status: 'booked',
        bookingSlot: {
          some: {
            slot: {
              date: {
                gte: startOfDay,
                lt: endOfDay,
              },
              startTime: formattedTime,
            },
          },
        },
      },
      select: {
        user: {
          select: {
            deviceTokens: { select: { token: true } },
          },
        },
        room: { select: { name: true } },
        bookingSlot: {
          orderBy: {
            slot: {
              startTime: 'asc',
            },
          },
          take: 1,
          select: {
            slot: {
              select: { startTime: true },
            },
          },
        },
      },
    });

    for (const booking of bookings) {
      await this.notification.notifyBookingReminder(
        booking.user.deviceTokens.map((device) => device.token),
        booking.room.name,
        booking.bookingSlot[0].slot.startTime,
      );
    }

    console.log('Cron job for booking reminder executed.');
  }
  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
