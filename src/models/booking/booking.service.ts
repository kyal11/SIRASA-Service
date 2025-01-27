import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { BookingEntity } from './serilization/booking.entity';
import { plainToInstance } from 'class-transformer';
import { CreateBookingDto } from './validation/createBooking.dto';
import { UpdateBookingDto } from './validation/updateBooking.dto';
import { statusBooking } from '@prisma/client';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllBooking(): Promise<BookingEntity[]> {
    const dataBooking = await this.prisma.bookings.findMany({
      include: {
        bookingSlot: {
          include: {
            slot: true,
          },
        },
      },
    });

    return dataBooking.map((data) => plainToInstance(BookingEntity, data));
  }

  async getBookingWithId(id: string): Promise<BookingEntity> {
    const dataBooking = await this.prisma.bookings.findUnique({
      where: {
        id: id,
      },
      include: {
        bookingSlot: {
          include: {
            slot: true,
          },
        },
      },
    });

    if (!dataBooking) {
      throw new HttpException(
        'Data Booking not found!',
        HttpStatus.BAD_REQUEST,
      );
    }

    return plainToInstance(BookingEntity, dataBooking);
  }

  async createBooking(dataBooking: CreateBookingDto): Promise<BookingEntity> {
    if (
      dataBooking.bookingSlotId.length < 1 ||
      dataBooking.bookingSlotId.length > 2
    ) {
      throw new HttpException(
        'You can only book up to 2 hours in one transaction.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const room = await this.prisma.rooms.findUnique({
      where: {
        id: dataBooking.roomId,
      },
    });
    if (!room) {
      throw new HttpException('Room not found!', HttpStatus.NOT_FOUND);
    }

    if (room.capacity < dataBooking.participant) {
      throw new HttpException(
        'The room capacity is not enough!',
        HttpStatus.NOT_FOUND,
      );
    }
    const slots = await this.prisma.slots.findMany({
      where: {
        id: {
          in: dataBooking.bookingSlotId,
        },
        roomId: dataBooking.roomId,
      },
    });

    if (slots.length !== dataBooking.bookingSlotId.length) {
      const invalidSlots = dataBooking.bookingSlotId.filter(
        (id) => !slots.some((slot) => slot.id === id),
      );
      throw new HttpException(
        `The following slots are invalid or not found: ${invalidSlots.join(', ')}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const sortedSlots = slots.sort((a, b) =>
      a.startTime.localeCompare(b.startTime),
    );
    for (let i = 0; i < sortedSlots.length - 1; i++) {
      if (sortedSlots[i].endTime !== sortedSlots[i + 1].startTime) {
        throw new HttpException(
          `Slots must be consecutive. Conflict found between (${sortedSlots[i].startTime} - ${sortedSlots[i].endTime}) and (${sortedSlots[i + 1].startTime} - ${sortedSlots[i + 1].endTime}).`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const bookedSlots = slots.filter((slot) => slot.isBooked);
    if (bookedSlots.length > 0) {
      const bookedSlotTimes = bookedSlots
        .map((slot) => `(${slot.startTime} - ${slot.endTime})`)
        .join(', ');
      throw new HttpException(
        `One or more slots are already booked: ${bookedSlotTimes}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.slots.updateMany({
      where: { id: { in: dataBooking.bookingSlotId } },
      data: { isBooked: true },
    });

    const booking = await this.prisma.bookings.create({
      data: {
        userId: dataBooking.userId,
        roomId: dataBooking.roomId,
        bookingSlot: {
          create: dataBooking.bookingSlotId.map((slotId) => ({ slotId })),
        },
        participant: dataBooking.participant,
      },
      include: {
        bookingSlot: {
          include: {
            slot: true,
          },
        },
      },
    });

    return plainToInstance(BookingEntity, booking);
  }

  async updateBooking(
    id: string,
    dataBooking: UpdateBookingDto,
  ): Promise<BookingEntity> {
    const booking = await this.prisma.bookings.findUnique({
      where: { id },
      include: { bookingSlot: true },
    });

    if (!booking) {
      throw new HttpException('Booking not found!', HttpStatus.NOT_FOUND);
    }

    if (dataBooking.roomId) {
      const roomExists = await this.prisma.rooms.findUnique({
        where: { id: dataBooking.roomId },
      });

      if (!roomExists) {
        throw new HttpException('Room not found!', HttpStatus.NOT_FOUND);
      }
    }

    const previousSlotIds = booking.bookingSlot.map((slot) => slot.slotId);
    await this.prisma.slots.updateMany({
      where: { id: { in: previousSlotIds } },
      data: { isBooked: false },
    });

    if (!dataBooking.bookingSlotId || dataBooking.bookingSlotId.length === 0) {
      throw new HttpException(
        'Slots must have at least one value!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newSlots = await this.prisma.slots.findMany({
      where: {
        id: { in: dataBooking.bookingSlotId },
        roomId: dataBooking.roomId || booking.roomId,
        isBooked: false,
      },
    });

    if (newSlots.length !== dataBooking.bookingSlotId.length) {
      const invalidSlots = dataBooking.bookingSlotId.filter(
        (id) => !newSlots.some((slot) => slot.id === id),
      );
      throw new HttpException(
        `The following slots are invalid or not found: ${invalidSlots.join(', ')}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const sortedSlots = newSlots.sort((a, b) =>
      a.startTime.localeCompare(b.startTime),
    );
    for (let i = 0; i < sortedSlots.length - 1; i++) {
      if (sortedSlots[i].endTime !== sortedSlots[i + 1].startTime) {
        throw new HttpException(
          `Slots must be consecutive. Conflict found between (${sortedSlots[i].startTime} - ${sortedSlots[i].endTime}) and (${sortedSlots[i + 1].startTime} - ${sortedSlots[i + 1].endTime}).`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    await this.prisma.slots.updateMany({
      where: { id: { in: dataBooking.bookingSlotId } },
      data: { isBooked: true },
    });

    const updatedBooking = await this.prisma.bookings.update({
      where: { id },
      data: {
        roomId: dataBooking.roomId || booking.roomId,
        userId: dataBooking.userId || booking.userId,
        bookingSlot: {
          deleteMany: {},
          create: dataBooking.bookingSlotId.map((slotId) => ({ slotId })),
        },
        updatedAt: new Date(),
      },
      include: {
        bookingSlot: true,
      },
    });

    return plainToInstance(BookingEntity, updatedBooking);
  }

  async updateStatusBooking(id: string): Promise<BookingEntity> {
    const booking = await this.prisma.bookings.findUnique({
      where: {
        id: id,
      },
    });
    if (!booking) {
      throw new HttpException(
        'Booking not found or Invalid Qr code.',
        HttpStatus.NOT_FOUND,
      );
    }
    if (booking.status == statusBooking.done) {
      throw new HttpException(
        'Booking not found or Invalid Qr code.',
        HttpStatus.NOT_FOUND,
      );
    }
    const updatedBooking = await this.prisma.bookings.update({
      where: {
        id: id,
      },
      data: {
        status: statusBooking.done,
      },
    });

    return plainToInstance(BookingEntity, updatedBooking);
  }

  async updateCancelBoking(id: string): Promise<BookingEntity> {
    const booking = await this.prisma.bookings.findUnique({
      where: {
        id: id,
      },
    });
    if (!booking) {
      throw new HttpException(
        'Booking not found or Invalid Qr code.',
        HttpStatus.NOT_FOUND,
      );
    }
    if (booking.status == statusBooking.cancel) {
      throw new HttpException(
        'Booking is already marked as cancel.',
        HttpStatus.NOT_FOUND,
      );
    }
    const updatedBooking = await this.prisma.bookings.update({
      where: {
        id: id,
      },
      data: {
        status: statusBooking.cancel,
      },
    });

    return plainToInstance(BookingEntity, updatedBooking);
  }

  async deleteBooking(id: string): Promise<string> {
    const booking = await this.prisma.bookings.findUnique({
      where: {
        id: id,
      },
      include: { bookingSlot: true },
    });
    if (!booking) {
      throw new HttpException(
        'Booking not found or Invalid Qr code.',
        HttpStatus.NOT_FOUND,
      );
    }
    const slotIds = booking.bookingSlot.map((slot) => slot.slotId);
    if (slotIds.length > 0) {
      await this.prisma.slots.updateMany({
        where: { id: { in: slotIds } },
        data: { isBooked: false },
      });
    }
    await this.prisma.bookingSlot.deleteMany({
      where: { bookingId: id },
    });
    await this.prisma.bookings.delete({
      where: { id },
    });

    return `Booking with ID ${id} has been deleted successfully.`;
  }
}
