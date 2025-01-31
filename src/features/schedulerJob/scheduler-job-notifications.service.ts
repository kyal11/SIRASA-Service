import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SchedulerJobNotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationsService,
  ) {}

  @Cron('1 * * * * *')
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

    console.log(`Booking data reminder:\n${JSON.stringify(bookings, null, 2)}`);
    for (const booking of bookings) {
      await this.notification.notifyBookingReminder(
        booking.user.deviceTokens.map((device) => device.token),
        booking.room.name,
        booking.bookingSlot[0].slot.startTime,
      );
    }

    console.log('Cron job for booking reminder executed.');
  }
  @Cron('1 * * * * *')
  async handleBookingDeadline(): Promise<void> {
    const nowDate = new Date();
    const timeDeadline = new Date(nowDate.getTime());
    const formattedTime = this.formatTime(timeDeadline);
    const startOfDay = new Date(nowDate.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(nowDate.setHours(23, 59, 59, 999)).toISOString();
    console.log(
      `Checking bookings for deadline at ${startOfDay}- ${endOfDay} in ${formattedTime}...`,
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

    console.log(`Booking data deadline:\n${JSON.stringify(bookings, null, 2)}`);
    for (const booking of bookings) {
      await this.notification.notifyValidationDeadline(
        booking.user.deviceTokens.map((device) => device.token),
        booking.room.name,
        booking.bookingSlot[0].slot.startTime,
      );
    }

    console.log('Cron job for booking reminder executed.');
  }

  @Cron('1 * * * * *')
  async handleAutoCancel(): Promise<void> {
    const nowDate = new Date();
    const tenMinutesAgo = new Date(nowDate.getTime() - 10 * 60 * 1000);
    const formattedTime = this.formatTime(tenMinutesAgo);
    const startOfDay = new Date(nowDate.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(nowDate.setHours(23, 59, 59, 999)).toISOString();

    console.log(
      `Checking for auto-cancel at ${startOfDay} - ${endOfDay} for bookings before ${formattedTime}...`,
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
        id: true,
        user: {
          select: {
            deviceTokens: { select: { token: true } },
          },
        },
        room: { select: { name: true } },
        bookingSlot: {
          select: {
            slotId: true,
          },
        },
      },
    });

    console.log(
      `Bookings to be canceled:\n${JSON.stringify(bookings, null, 2)}`,
    );
    if (bookings.length === 0) {
      console.log('No bookings to cancel.');
      return;
    }

    for (const booking of bookings) {
      await this.prisma.bookings.update({
        where: { id: booking.id },
        data: { status: 'cancel' },
      });
      await this.prisma.slots.updateMany({
        where: {
          id: { in: booking.bookingSlot.map((slot) => slot.slotId) },
        },
        data: { isBooked: false },
      });
      await this.notification.notifyAutomaticCancellation(
        booking.user.deviceTokens.map((device) => device.token),
        booking.room.name,
        formattedTime,
      );
    }
    console.log('Auto-cancel process completed.');
  }

  @Cron('1 * * * * *')
  async handleBookingEndTimeReminder(): Promise<void> {
    const nowDate = new Date();
    const timeDeadline = new Date(nowDate.getTime() + 10 * 60 * 1000);
    const formattedTime = this.formatTime(timeDeadline);
    const startOfDay = new Date(nowDate.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(nowDate.setHours(23, 59, 59, 999)).toISOString();
    console.log(
      `Checking bookings for endTime at ${startOfDay}- ${endOfDay} in ${formattedTime}...`,
    );

    const bookings = await this.prisma.bookings.findMany({
      where: {
        status: 'done',
        bookingSlot: {
          some: {
            slot: {
              date: {
                gte: startOfDay,
                lt: endOfDay,
              },
              endTime: formattedTime,
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
              endTime: 'desc',
            },
          },
          take: 1,
          select: {
            slot: {
              select: { endTime: true },
            },
          },
        },
      },
    });

    console.log(`Booking data endTime:\n${JSON.stringify(bookings, null, 2)}`);
    for (const booking of bookings) {
      await this.notification.notifyEndTimeReminder(
        booking.user.deviceTokens.map((device) => device.token),
        booking.room.name,
        10,
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
