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

  @Cron('*/10 * * * *')
  async handleBookingReminder(): Promise<void> {
    const nowDate = new Date();
    const tenMinutesLater = new Date(nowDate.getTime() + 10 * 60 * 1000);
    const formattedTime = this.formatTime(tenMinutesLater);
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
  @Cron('*/10 * * * *')
  async handleBookingDeadline(): Promise<void> {
    const nowDate = new Date();
    const deadlineTime = new Date(nowDate.getTime());
    const formattedTime = this.formatTime(deadlineTime);
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
      `Checking bookings for dedline at ${startOfDay}- ${endOfDay} in ${formattedTime}...`,
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

  @Cron('* * * * *')
  async handleAutoCancel(): Promise<void> {
    const nowDate = new Date();

    console.log(`
      Checking for auto-cancel at ${nowDate.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`);
    const jakartaOffsetMinutes = 7 * 60; // UTC+7
    const jakartaNow = new Date(
      nowDate.getTime() + jakartaOffsetMinutes * 60 * 1000,
    );

    const jakartaYear = jakartaNow.getUTCFullYear();
    const jakartaMonth = jakartaNow.getUTCMonth();
    const jakartaDate = jakartaNow.getUTCDate();

    console.log(`
      Sekarang Jakarta: ${jakartaNow.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`);

    const startOfDayJakarta = new Date(
      Date.UTC(
        jakartaYear,
        jakartaMonth,
        jakartaDate,
        -jakartaOffsetMinutes / 60,
        0,
        0,
      ),
    );
    const endOfDayJakarta = new Date(
      Date.UTC(
        jakartaYear,
        jakartaMonth,
        jakartaDate,
        23 - jakartaOffsetMinutes / 60,
        59,
        59,
        999,
      ),
    );
    console.log(`
      Start of Day Jakarta: ${startOfDayJakarta.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`);
    console.log(`
      End of Day Jakarta: ${endOfDayJakarta.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`);
    // Ambil semua booking yang masih "booked" hari ini
    const bookings = await this.prisma.bookings.findMany({
      where: {
        status: 'booked',
        bookingSlot: {
          some: {
            slot: {
              date: {
                gte: startOfDayJakarta.toISOString(),
                lt: endOfDayJakarta.toISOString(),
              },
            },
          },
        },
      },
      select: {
        id: true,
        createdAt: true,
        user: {
          select: {
            deviceTokens: { select: { token: true } },
          },
        },
        room: { select: { name: true } },
        bookingSlot: {
          select: {
            slotId: true,
            slot: {
              select: { date: true, startTime: true },
            },
          },
          orderBy: {
            slot: {
              startTime: 'asc',
            },
          },
        },
      },
    });

    console.log(bookings);
    if (bookings.length === 0) {
      console.log('No active bookings found.');
      return;
    }

    const bookingsToCancel = [];

    for (const booking of bookings) {
      const sortedSlots = booking.bookingSlot.sort((a, b) => {
        const [aHours, aMinutes] = a.slot.startTime.split(':').map(Number);
        const [bHours, bMinutes] = b.slot.startTime.split(':').map(Number);
        return aHours !== bHours ? aHours - bHours : aMinutes - bMinutes;
      });

      const firstSlot = sortedSlots[0].slot;
      // Convert first slot startTime ke Date
      const [startHour, startMinute] = firstSlot.startTime
        .split(':')
        .map(Number);
      const slotStartDate = new Date(firstSlot.date);
      slotStartDate.setUTCHours(startHour);
      slotStartDate.setUTCMinutes(startMinute);
      slotStartDate.setUTCSeconds(0);
      slotStartDate.setUTCMilliseconds(0);

      let cancelDeadline: Date;
      const bookingCreatedAtUTC = new Date(booking.createdAt);
      const bookingTime = bookingCreatedAtUTC.toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      // Konversi tanggal slot dan now ke zona Jakarta
      const slotDateJakarta = new Date(
        new Date(firstSlot.date).getTime() - 7 * 60 * 60 * 1000,
      );
      const nowJakarta = new Date(nowDate.getTime() + 7 * 60 * 60 * 1000);
      const bookingCreatedAtJakarta = new Date(
        bookingCreatedAtUTC.getTime() + 7 * 60 * 60 * 1000,
      );
      const isSameDay =
        bookingCreatedAtJakarta.getFullYear() === nowJakarta.getFullYear() &&
        bookingCreatedAtJakarta.getMonth() === nowJakarta.getMonth() &&
        bookingCreatedAtJakarta.getDate() === nowJakarta.getDate();
      const [bookingHour, bookingMinute] = bookingTime.split('.').map(Number);
      const bookingTotalMinutes = bookingHour * 60 + bookingMinute;
      const slotStartTotalMinutes = startHour * 60 + startMinute;
      let isAfterSlotStart = false;
      if (isSameDay) {
        isAfterSlotStart = bookingTotalMinutes > slotStartTotalMinutes;
      }
      console.log('=============================');
      console.log(`Booking ID         ➔ ${booking.id}`);
      console.log(
        `Booking time       ➔ ${bookingTime} ➔ ${bookingHour}:${bookingMinute}`,
      );
      console.log(`Slot start time    ➔ ${startHour}:${startMinute}`);
      console.log(`Booking Minutes    ➔ ${bookingTotalMinutes}`);
      console.log(`Slot Start Minutes ➔ ${slotStartTotalMinutes}`);
      console.log(`Tanggal Slot       ➔ ${slotDateJakarta.toDateString()}`);
      console.log(`Tanggal Sekarang   ➔ ${nowJakarta.toDateString()}`);
      console.log(`Tanggal Booking dan Tanggal Hari ini?      ➔ ${isSameDay}`);
      console.log(`isAfterSlotStart   ➔ ${isAfterSlotStart}`);
      console.log('=============================');

      if (isAfterSlotStart) {
        // Kalau booking dibuat setelah waktu start slot ➔ cancelDeadline = createdAt + 10 menit
        const adjustedBookingStart = new Date(booking.createdAt.getTime());

        console.log(
          `[AFTER SLOT START] Booking Created At (Raw) ➔ ${booking.createdAt.toISOString()}`,
        );
        console.log(
          `[AFTER SLOT START] Booking Created At ➔ ${adjustedBookingStart.toISOString()}`,
        );

        cancelDeadline = new Date(
          adjustedBookingStart.getTime() + 10 * 60 * 1000,
        );

        console.log(
          `[AFTER SLOT START] Cancel Deadline ➔ ${cancelDeadline.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`,
        );
      } else {
        // Kalau booking dibuat sebelum slot start ➔ cancelDeadline = slot start + 10 menit
        const adjustedSlotStart = new Date(
          slotStartDate.getTime() - 7 * 60 * 60 * 1000,
        );

        console.log(
          `[BEFORE SLOT START] Slot Start Date (Raw) ➔ ${slotStartDate.toISOString()}`,
        );
        console.log(
          `[BEFORE SLOT START] Slot Start Date (Adjusted -7 jam) ➔ ${adjustedSlotStart.toISOString()}`,
        );

        cancelDeadline = new Date(adjustedSlotStart.getTime() + 10 * 60 * 1000);

        console.log(
          `[BEFORE SLOT START] Cancel Deadline ➔ ${cancelDeadline.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`,
        );
      }

      console.log('=============================');
      console.log(
        `[NOW] Sekarang: ${nowDate.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`,
      );
      console.log(`[NOW] Sekarang (ISO): ${nowDate.toISOString()}`);
      console.log(
        `[DEADLINE] Cancel Deadline: ${cancelDeadline.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`,
      );
      console.log(
        `[DEADLINE] Cancel Deadline (ISO): ${cancelDeadline.toISOString()}`,
      );

      if (nowDate > cancelDeadline) {
        console.log(
          '❌❌ Booking Melewati Batas Cancel, Akan Dimasukkan ke bookingsToCancel ❌❌',
        );

        bookingsToCancel.push({
          bookingId: booking.id,
          slotIds: booking.bookingSlot.map((s) => s.slotId),
          userTokens: booking.user.deviceTokens.map((device) => device.token),
          roomName: booking.room.name,
          deadline: cancelDeadline.toISOString(),
        });
      } else {
        console.log('✅ Booking Masih Aktif, Tidak Dibatalkan ✅');
      }

      console.log('=============================');
    }
    if (bookingsToCancel.length === 0) {
      console.log('No bookings to auto-cancel at this time.');
      return;
    }

    // Eksekusi pembatalan
    for (const cancelInfo of bookingsToCancel) {
      const booking = await this.prisma.bookings.update({
        where: { id: cancelInfo.bookingId },
        data: { status: 'cancel' },
        include: {
          bookingSlot: {
            select: {
              slot: {
                select: {
                  startTime: true,
                  endTime: true,
                  date: true,
                },
              },
            },
          },
        },
      });
      const sortedSlots = booking.bookingSlot.sort((a, b) => {
        const [aHours, aMinutes] = a.slot.startTime.split(':').map(Number);
        const [bHours, bMinutes] = b.slot.startTime.split(':').map(Number);
        return aHours !== bHours ? aHours - bHours : aMinutes - bMinutes;
      });

      const firstSlot = sortedSlots[0].slot;

      // Convert first slot startTime ke Date
      const [startHour, startMinute] = firstSlot.endTime.split(':').map(Number);
      const slotStartDate = new Date(firstSlot.date);
      slotStartDate.setUTCHours(startHour);
      slotStartDate.setUTCMinutes(startMinute);
      slotStartDate.setUTCSeconds(0);
      slotStartDate.setUTCMilliseconds(0);

      // Misalkan slotStartDate itu UTC
      const adjustedSlotStart = new Date(
        slotStartDate.getTime() - 7 * 60 * 60 * 1000,
      );

      // Setelah dikurangi 7 jam, tambahkan 30 menit
      const freeSlotDeadline = new Date(
        adjustedSlotStart.getTime() + 5 * 60 * 1000,
      );

      console.log('-----------------------------');
      console.log(`Booking ID ➔ ${cancelInfo.bookingId}`);
      console.log(`Slot Start ➔ ${slotStartDate.toISOString()}`);
      console.log(
        `Free Slot Deadline (Start +40m) ➔ ${freeSlotDeadline.toISOString()}`,
      );
      console.log(`Now ➔ ${new Date().toISOString()}`);

      if (new Date() <= freeSlotDeadline) {
        await this.prisma.slots.updateMany({
          where: { id: { in: cancelInfo.slotIds } },
          data: { isBooked: false },
        });
        console.log(`✅ Slot berhasil di-free-kan!`);
      } else {
        console.log(`⛔ Melewati batas 40 menit, slot tidak di-free-kan.`);
      }

      const startTime = sortedSlots[0]?.slot.startTime ?? '-';
      const endTime = sortedSlots[sortedSlots.length - 1]?.slot.endTime ?? '-';

      await this.notification.notifyAutomaticCancellation(
        cancelInfo.userTokens,
        cancelInfo.roomName,
        `${startTime} - ${endTime}`,
      );

      console.log(`Auto-canceled booking ID ${cancelInfo.bookingId}`);
    }

    console.log(
      `Auto-cancel process completed for ${bookingsToCancel.length} bookings.`,
    );
  }

  // @Cron('*/10 * * * *')
  // async handleAutoCancel(): Promise<void> {
  //   const nowDate = new Date();
  //   const tenMinutesAgo = new Date(nowDate.getTime() - 10 * 60 * 1000);
  //   const formattedTime = this.formatTime(tenMinutesAgo);
  //   const startOfDay = new Date(
  //     Date.UTC(
  //       nowDate.getUTCFullYear(),
  //       nowDate.getUTCMonth(),
  //       nowDate.getUTCDate(),
  //       0,
  //       0,
  //       0,
  //       0,
  //     ),
  //   ).toISOString();

  //   const endOfDay = new Date(
  //     Date.UTC(
  //       nowDate.getUTCFullYear(),
  //       nowDate.getUTCMonth(),
  //       nowDate.getUTCDate(),
  //       23,
  //       59,
  //       59,
  //       999,
  //     ),
  //   ).toISOString();

  //   console.log(
  //     `Checking for auto-cancel at ${startOfDay} - ${endOfDay} for bookings before ${formattedTime}...`,
  //   );

  //   const bookings = await this.prisma.bookings.findMany({
  //     where: {
  //       status: 'booked',
  //       bookingSlot: {
  //         some: {
  //           slot: {
  //             date: {
  //               gte: startOfDay,
  //               lt: endOfDay,
  //             },
  //             startTime: formattedTime,
  //           },
  //         },
  //       },
  //     },
  //     select: {
  //       id: true,
  //       user: {
  //         select: {
  //           deviceTokens: { select: { token: true } },
  //         },
  //       },
  //       room: { select: { name: true } },
  //       bookingSlot: {
  //         select: {
  //           slotId: true,
  //         },
  //       },
  //     },
  //   });

  //   console.log(
  //     `Bookings to be canceled:\n${JSON.stringify(bookings, null, 2)}`,
  //   );
  //   if (bookings.length === 0) {
  //     console.log('No bookings to cancel.');
  //     return;
  //   }

  //   for (const booking of bookings) {
  //     await this.prisma.bookings.update({
  //       where: { id: booking.id },
  //       data: { status: 'cancel' },
  //     });
  //     await this.prisma.slots.updateMany({
  //       where: {
  //         id: { in: booking.bookingSlot.map((slot) => slot.slotId) },
  //       },
  //       data: { isBooked: false },
  //     });
  //     await this.notification.notifyAutomaticCancellation(
  //       booking.user.deviceTokens.map((device) => device.token),
  //       booking.room.name,
  //       formattedTime,
  //     );
  //   }
  //   console.log('Auto-cancel process completed.');
  // }

  @Cron('*/10 * * * *')
  async handleBookingEndTimeReminder(): Promise<void> {
    const nowDate = new Date();
    const tenMinutesLater = new Date(nowDate.getTime() + 10 * 60 * 1000);
    const formattedTime = this.formatTime(tenMinutesLater);
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
      `Checking bookings for end time reminder at ${startOfDay}- ${endOfDay} in ${formattedTime}...`,
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
      // await this.notification.notifyEndTimeReminder(
      //   booking.user.deviceTokens.map((device) => device.token),
      //   booking.room.name,
      //   10,
      // );
      const sortedSlots = booking.bookingSlot.sort((a, b) => {
        return a.slot.endTime.localeCompare(b.slot.endTime);
      });

      const lastSlot = sortedSlots[sortedSlots.length - 1];

      if (lastSlot && lastSlot.slot.endTime === formattedTime) {
        await this.notification.notifyEndTimeReminder(
          booking.user.deviceTokens.map((device) => device.token),
          booking.room.name,
          10,
        );
      }
    }

    console.log('Cron job for booking reminder executed.');
  }
  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
