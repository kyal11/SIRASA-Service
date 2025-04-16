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
        0,
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

  @Cron('0 0 * * *')
  async expiredSlots(): Promise<void> {
    const nowDate = new Date();

    const jakartaOffsetMinutes = 7 * 60; // UTC+7
    const jakartaNow = new Date(
      nowDate.getTime() + jakartaOffsetMinutes * 60 * 1000,
    );

    const jakartaYear = jakartaNow.getUTCFullYear();
    const jakartaMonth = jakartaNow.getUTCMonth();
    const jakartaDate = jakartaNow.getUTCDate();

    console.log(
      `Sekarang Jakarta: ${jakartaNow.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`,
    );

    const startOfDayJakarta = new Date(
      Date.UTC(
        jakartaYear,
        jakartaMonth,
        jakartaDate - 1,
        -jakartaOffsetMinutes / 60,
        0,
        0,
      ),
    );
    const endOfDayJakarta = new Date(
      Date.UTC(
        jakartaYear,
        jakartaMonth,
        jakartaDate - 1,
        23 - jakartaOffsetMinutes / 60,
        59,
        59,
        999,
      ),
    );

    const updatedSlots = await this.prisma.slots.updateMany({
      where: {
        date: {
          gte: startOfDayJakarta.toISOString(),
          lt: endOfDayJakarta.toISOString(),
        },
      },
      data: {
        isExpired: true,
      },
    });
    console.log(`Expired slots updated: ${updatedSlots.count}`);
  }
  // @Cron('0 0 * * *')
  // async deleteUnusedYesterdaySlots(): Promise<void> {
  //   try {
  //     console.log('Starting to delete unused slots from yesterday...');

  //     const nowDate = new Date();

  //     const jakartaOffsetMinutes = 7 * 60; // UTC+7
  //     const jakartaNow = new Date(
  //       nowDate.getTime() + jakartaOffsetMinutes * 60 * 1000,
  //     );

  //     const jakartaYear = jakartaNow.getUTCFullYear();
  //     const jakartaMonth = jakartaNow.getUTCMonth();
  //     const jakartaDate = jakartaNow.getUTCDate();

  //     console.log(
  //       `Sekarang Jakarta: ${jakartaNow.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`,
  //     );

  //     const startOfDayJakarta = new Date(
  //       Date.UTC(
  //         jakartaYear,
  //         jakartaMonth,
  //         jakartaDate - 1,
  //         -jakartaOffsetMinutes / 60,
  //         0,
  //         0,
  //       ),
  //     );
  //     const endOfDayJakarta = new Date(
  //       Date.UTC(
  //         jakartaYear,
  //         jakartaMonth,
  //         jakartaDate - 1,
  //         23 - jakartaOffsetMinutes / 60,
  //         59,
  //         59,
  //         999,
  //       ),
  //     );

  //     const unusedSlots = await this.prisma.slots.findMany({
  //       where: {
  //         date: {
  //           gte: startOfDayJakarta.toISOString(),
  //           lt: endOfDayJakarta.toISOString(),
  //         },
  //         isBooked: false,
  //         bookingSlot: {
  //           none: {},
  //         },
  //       },
  //       select: {
  //         id: true,
  //       },
  //     });

  //     console.log(
  //       `Found ${unusedSlots.length} unused slots from yesterday to delete.`,
  //     );

  //     if (unusedSlots.length > 0) {
  //       const slotIds = unusedSlots.map((slot) => slot.id);

  //       const deleteResult = await this.prisma.slots.deleteMany({
  //         where: {
  //           id: { in: slotIds },
  //         },
  //       });

  //       console.log(`Deleted ${deleteResult.count} slots from yesterday.`);
  //     } else {
  //       console.log('No unused slots found for yesterday.');
  //     }
  //   } catch (error) {
  //     console.error('Error deleting unused slots from yesterday:', error);
  //   }
  // }

  @Cron('*/10 * * * *')
  async closeTimeSlotBooking(): Promise<void> {
    const nowDate = new Date();
    const closeTime = new Date(nowDate.getTime() + 20 * 60 * 1000);
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
    console.log(
      `close time slot booking at ${startOfDay}- ${endOfDay} in ${formattedTime}...`,
    );

    const closeSlots = await this.prisma.slots.updateMany({
      where: {
        date: {
          gte: startOfDay,
          lt: endOfDay,
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
