import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SchedulerJobSlotService {
  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 0 * * *')
  async autoSeedSlots(): Promise<void> {
    const today = new Date();

    const next3Days = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate() + 3,
        0,
        2,
        0,
        0,
      ),
    );
    console.log(`Seeding slots for date: ${next3Days.toISOString()}`);

    const rooms = await this.prisma.rooms.findMany({
      select: {
        id: true,
        startTime: true,
        endTime: true,
      },
    });

    for (const room of rooms) {
      const startHour = parseInt(room.startTime.split(':')[0], 10);
      const endHour = parseInt(room.endTime.split(':')[0], 10);

      const newSlots = [];

      for (let hour = startHour; hour < endHour; hour++) {
        const slotStartTime = `${hour.toString().padStart(2, '0')}:00`;
        const slotEndTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

        newSlots.push({
          id: crypto.randomUUID(),
          roomId: room.id,
          date: next3Days.toISOString(),
          startTime: slotStartTime,
          endTime: slotEndTime,
          isBooked: false,
          isExpired: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      if (newSlots.length > 0) {
        await this.prisma.slots.createMany({ data: newSlots });
      }
    }

    console.log(
      `Slots for ${next3Days.toISOString().split('T')[0]} have been created.`,
    );
  }

  @Cron('0 0 * * * *')
  async expiredSlots(): Promise<void> {
    const nowDate = new Date();

    const startOfYesterdayUTC = new Date(
      Date.UTC(
        nowDate.getUTCFullYear(),
        nowDate.getUTCMonth(),
        nowDate.getUTCDate() - 1,
        0,
        0,
        0,
        0,
      ),
    );

    const endOfYesterdayUTC = new Date(
      Date.UTC(
        nowDate.getUTCFullYear(),
        nowDate.getUTCMonth(),
        nowDate.getUTCDate() - 1,
        23,
        59,
        59,
        999,
      ),
    );

    console.log('Start of Yesterday (UTC):', startOfYesterdayUTC);
    console.log('End of Yesterday (UTC):', endOfYesterdayUTC);

    const updatedSlots = await this.prisma.slots.updateMany({
      where: {
        date: {
          gte: startOfYesterdayUTC,
          lte: endOfYesterdayUTC,
        },
      },
      data: {
        isExpired: true,
      },
    });
    console.log(`Expired slots updated: ${updatedSlots.count}`);
  }

  @Cron('*/10 * * * *')
  async closeTimeSlotBooking(): Promise<void> {
    const nowDate = new Date();
    const closeTime = new Date(nowDate.getTime() + 10 * 60 * 1000);
    const formattedTime = this.formatTime(closeTime);
    const startOfDay = new Date(
      Date.UTC(
        nowDate.getUTCFullYear(),
        nowDate.getUTCMonth(),
        nowDate.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    ).toISOString();

    const endOfDay = new Date(
      Date.UTC(
        nowDate.getUTCFullYear(),
        nowDate.getUTCMonth(),
        nowDate.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    ).toISOString();

    const closeSlots = await this.prisma.slots.updateMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        isBooked: false,
        endTime: formattedTime,
      },
      data: {
        isBooked: true,
      },
    });
    console.log(`Close Time slots updated: ${closeSlots.count}`);
  }

  public formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
