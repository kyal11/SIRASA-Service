import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { BookingEntity } from './serilization/booking.entity';
import { plainToInstance } from 'class-transformer';
import { CreateBookingDto } from './validation/createBooking.dto';
import { UpdateBookingDto } from './validation/updateBooking.dto';
import { statusBooking } from '@prisma/client';
import { NotificationsService } from 'src/features/notifications/notifications.service';
import { PaginatedOutputDto } from 'src/common/paginate/paginated-output.dto';
import { RecommendationEntity } from 'src/features/recommendationRoom/serilization/recommendation.entity';
import { GreedyRecommendation } from 'src/features/recommendationRoom/greedy-recommendation';
import { ApiResponse } from '../../common/api-response.entity';
import { BookingGateway } from './booking-gateway';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly NotificationsService: NotificationsService,
    private readonly recommendation: GreedyRecommendation,
    private readonly bookingGateway: BookingGateway,
  ) {}

  async getAllBooking(): Promise<BookingEntity[]> {
    const dataBooking = await this.prisma.bookings.findMany({
      include: {
        room: true,
        bookingSlot: {
          include: {
            slot: true,
          },
        },
      },
    });

    return dataBooking.map((data) =>
      plainToInstance(
        BookingEntity,
        {
          ...data,
          roomName: data.room?.name,
          roomCapacity: data.room?.capacity,
          slots: data.bookingSlot.map((slot) => ({
            id: slot.slot.id,
            slotId: slot.slot.id,
            startTime: slot.slot.startTime,
            endTime: slot.slot.endTime,
          })),
        },
        { excludeExtraneousValues: true },
      ),
    );
  }

  async getAllBookingPaginate(
    page: number = 1,
    perPage: number = 10,
  ): Promise<PaginatedOutputDto<BookingEntity>> {
    const total = await this.prisma.bookings.count();
    const skip = (page - 1) * perPage;
    const dataBooking = await this.prisma.bookings.findMany({
      skip: skip,
      take: perPage,
      include: {
        room: true,
        bookingSlot: {
          include: {
            slot: true,
          },
        },
      },
    });

    const bookings = dataBooking.map((data) =>
      plainToInstance(
        BookingEntity,
        {
          ...data,
          roomName: data.room?.name,
          roomCapacity: data.room?.capacity,
          slots: data.bookingSlot.map((slot) => ({
            id: slot.slot.id,
            slotId: slot.slot.id,
            startTime: slot.slot.startTime,
            endTime: slot.slot.endTime,
          })),
        },
        { excludeExtraneousValues: true },
      ),
    );

    const lastPage = Math.ceil(total / perPage);

    return {
      data: bookings,
      meta: {
        total: total,
        lastPage: lastPage,
        currentPage: page,
        perPage: perPage,
        prev: page > 1 ? page - 1 : null,
        next: page < lastPage ? page + 1 : null,
      },
    };
  }
  async getUserHistoryBooking(userId: string): Promise<BookingEntity[]> {
    console.log(`Fetching history bookings for userId: ${userId}`);

    const dataHistory = await this.prisma.bookings.findMany({
      where: {
        userId: userId,
        status: { in: ['cancel', 'done'] },
      },
      include: {
        room: true,
        bookingSlot: {
          include: {
            slot: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(
      `Found ${dataHistory.length} history bookings for userId: ${userId}`,
    );

    if (dataHistory.length === 0) {
      console.warn(`No history bookings found for userId: ${userId}`);

      throw new HttpException(
        'History Booking Not found!',
        HttpStatus.NOT_FOUND,
      );
    }

    return dataHistory.map((data) => plainToInstance(BookingEntity, data));
  }

  async getUserActiveBooking(userId: string): Promise<BookingEntity[]> {
    console.log(`Fetching active bookings for userId: ${userId}`);

    const dataHistoryActive = await this.prisma.bookings.findMany({
      where: {
        userId: userId,
        status: { in: ['booked'] },
      },
      include: {
        room: true,
        bookingSlot: {
          include: {
            slot: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(
      `Found ${dataHistoryActive.length} active bookings for userId: ${userId}`,
    );

    if (dataHistoryActive.length === 0) {
      console.warn(`No active bookings found for userId: ${userId}`);
      throw new HttpException(
        'History Booking Not found!',
        HttpStatus.NOT_FOUND,
      );
    }

    return dataHistoryActive.map((data) =>
      plainToInstance(BookingEntity, data),
    );
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

  async createBooking(
    userId: string,
    dataBooking: CreateBookingDto,
  ): Promise<ApiResponse<BookingEntity | RecommendationEntity[]>> {
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

    const rooms = await this.prisma.rooms.findMany({
      include: {
        slots: {
          orderBy: {
            startTime: 'asc',
          },
          where: {
            isExpired: false,
          },
        },
      },
    });
    if (room.capacity < dataBooking.participant) {
      // throw new HttpException(
      //   'The room capacity is not enough!',
      //   HttpStatus.NOT_FOUND,
      // );
      const recommendations = this.recommendation.recommend(
        {
          roomId: dataBooking.roomId,
          participant: dataBooking.participant,
          slots,
        },
        rooms,
      );
      return plainToInstance(ApiResponse, {
        status: 'recommendation',
        message:
          'Room capacity is not sufficient. Here are some recommendations:',
        data: recommendations,
      });
    }
    const bookedSlots = slots.filter((slot) => slot.isBooked);
    if (bookedSlots.length > 0) {
      // const bookedSlotTimes = bookedSlots
      //   .map((slot) => `(${slot.startTime} - ${slot.endTime})`)
      //   .join(', ');
      // throw new HttpException(
      //   `One or more slots are already booked: ${bookedSlotTimes}.`,
      //   HttpStatus.BAD_REQUEST,
      // );
      const recommendations = this.recommendation.recommend(
        {
          roomId: dataBooking.roomId,
          participant: dataBooking.participant,
          slots,
        },
        rooms,
      );

      return plainToInstance(ApiResponse, {
        status: 'recommendation',
        message:
          'Selected slots are unavailable. Here are alternative options:',
        data: recommendations,
      });

      // return this.recommendation.recommend(
      //   {
      //     roomId: dataBooking.roomId,
      //     participant: dataBooking.participant,
      //     slots: slots,
      //   },
      //   rooms,
      // );
    }

    // Buat Booking
    const booking = await this.prisma.bookings.create({
      data: {
        userId: userId,
        roomId: dataBooking.roomId,
        bookingSlot: {
          create: dataBooking.bookingSlotId.map((slotId) => ({ slotId })),
        },
        participant: dataBooking.participant,
        description: dataBooking.description,
      },
      include: {
        user: true,
        room: true,
        bookingSlot: {
          include: {
            slot: true,
          },
        },
      },
    });
    await this.prisma.slots.updateMany({
      where: { id: { in: dataBooking.bookingSlotId } },
      data: { isBooked: true },
    });
    //Notifikasi berhasil
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      include: { deviceTokens: true },
    });
    const recipientTokens =
      user?.deviceTokens.map((token) => token.token) || [];
    const bookingDate = new Date().toLocaleDateString();
    const timeSlot = sortedSlots
      .map((slot) => `${slot.startTime} - ${slot.endTime}`)
      .join(', ');

    await this.NotificationsService.notifyBookingConfirmation(
      recipientTokens,
      room.name,
      bookingDate,
      timeSlot,
    );

    return plainToInstance(ApiResponse, {
      status: 'success',
      message: 'Booking succesfully created!',
      data: booking,
    });
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
        user: true,
        bookingSlot: true,
      },
    });

    return plainToInstance(
      BookingEntity,
      {
        ...updatedBooking,
        userName: updatedBooking.user.name,
        phoneNumber: updatedBooking.user.phoneNumber,
      },
      { excludeExtraneousValues: true },
    );
  }

  async updateStatusBooking(
    id: string,
    userIdAdmin: string,
  ): Promise<BookingEntity> {
    const booking = await this.prisma.bookings.findUnique({
      where: { id },
      include: { user: { include: { deviceTokens: true } }, room: true },
    });
    if (!booking) {
      throw new HttpException(
        'Peminjaman tidak ditemukan!',
        HttpStatus.NOT_FOUND,
      );
    }
    if (booking.status == statusBooking.done) {
      throw new HttpException(
        'Peminjaman telah selesai!',
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
      include: {
        bookingSlot: {
          include: {
            slot: true,
          },
        },
        room: true,
      },
    });

    const userTokens = booking.user.deviceTokens.map((token) => token.token);
    await this.NotificationsService.notifyUserQRValidation(
      userTokens,
      booking.room.name,
      new Date().toLocaleTimeString(),
      booking.user.name,
    );

    const admin = await this.prisma.users.findUnique({
      where: { id: userIdAdmin },
      include: { deviceTokens: true },
    });

    const adminTokens = admin.deviceTokens.map((token) => token.token);

    await this.NotificationsService.notifyAdminQRValidation(
      adminTokens,
      booking.room.name,
      new Date().toLocaleTimeString(),
      booking.user.name,
    );
    this.bookingGateway.sendBookingUpdate(
      updatedBooking.userId,
      updatedBooking,
    );
    return plainToInstance(BookingEntity, updatedBooking);
  }

  async updateCancelBoking(id: string): Promise<BookingEntity> {
    const booking = await this.prisma.bookings.findUnique({
      where: {
        id: id,
      },
      include: {
        user: { include: { deviceTokens: true } },
        room: true,
        bookingSlot: true,
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
    await this.prisma.slots.updateMany({
      where: {
        id: {
          in: booking.bookingSlot.map((slot) => slot.slotId),
        },
      },
      data: {
        isBooked: false,
      },
    });
    const updatedBooking = await this.prisma.bookings.update({
      where: {
        id: id,
      },
      data: {
        status: statusBooking.cancel,
      },
      include: {
        bookingSlot: true,
      },
    });
    await this.NotificationsService.notifyBookingCanceled(
      booking.user.deviceTokens.map((token) => token.token),
      booking.room.name,
    );
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
