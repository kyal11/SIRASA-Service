import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RoomEntity } from './serialization/room.entity';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { plainToClass, plainToInstance } from 'class-transformer';
import { CreateRoomDto } from './validation/create-room.dto';
import { UpdateRoomDto } from './validation/update-room.dto';

@Injectable()
export class RoomService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllRoom(): Promise<RoomEntity[]> {
    const roomData = await this.prisma.rooms.findMany();
    return roomData.map((data) => plainToClass(RoomEntity, data));
  }

  async getAllRoomWithSlot(dayFilter?: number): Promise<RoomEntity[]> {
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
        date: {
          gte: startDate.toISOString(),
          lte: endDate.toISOString(),
        },
      };
    }

    const roomData = await this.prisma.rooms.findMany({
      orderBy: [{ floor: 'asc' }, { capacity: 'asc' }],
      include: {
        slots: {
          orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
          where: {
            isExpired: false,
            ...dateFilter,
          },
        },
      },
    });

    return roomData.map((data) =>
      plainToInstance(RoomEntity, data, { excludeExtraneousValues: true }),
    );
  }

  async getRoomById(id: string, dayFilter?: number): Promise<RoomEntity> {
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
        date: {
          gte: startDate.toISOString(),
          lte: endDate.toISOString(),
        },
      };
    }
    const existingRoom = await this.prisma.rooms.findUnique({
      where: {
        id: id,
      },
      include: {
        slots: {
          orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
          where: {
            isExpired: false,
            ...dateFilter,
          },
        },
      },
    });

    if (!existingRoom) {
      throw new HttpException('Data Room not found!', HttpStatus.BAD_REQUEST);
    }

    return plainToClass(RoomEntity, existingRoom, {
      excludeExtraneousValues: true,
    });
  }

  async createRoom(roomData: CreateRoomDto): Promise<RoomEntity> {
    try {
      const createdRoom = await this.prisma.rooms.create({
        data: {
          name: roomData.name,
          floor: roomData.floor,
          capacity: roomData.capacity,
          startTime: roomData.startTime,
          endTime: roomData.endTime,
        },
      });
      return plainToClass(RoomEntity, createdRoom);
    } catch (error) {
      throw new HttpException(
        `Failed to create Room : ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createRoomWithSlot(roomData: CreateRoomDto): Promise<RoomEntity> {
    const createdRoom = await this.prisma.rooms.create({
      data: {
        name: roomData.name,
        floor: roomData.floor,
        capacity: roomData.capacity,
        startTime: roomData.startTime,
        endTime: roomData.endTime,
        slots: {
          create: roomData.slots?.map((slot) => ({
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isBooked: slot.isBooked,
          })),
        },
      },
    });

    const today = new Date();
    const days = [today];
    for (let i = 1; i <= 2; i++) {
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + i);
      days.push(nextDay);
    }

    const startHour = parseInt(createdRoom.startTime.split(':')[0], 10);
    const endHour = parseInt(createdRoom.endTime.split(':')[0], 10);

    const newSlots = [];

    for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
      const day = days[dayIndex];
      const dateString = day.toISOString().split('T')[0];
      for (let hour = startHour; hour < endHour; hour++) {
        const slotStartTime = `${hour.toString().padStart(2, '0')}:00`;
        const slotEndTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
        newSlots.push({
          id: crypto.randomUUID(),
          roomId: createdRoom.id,
          date: new Date(`${dateString}T00:00:00Z`).toISOString(),
          startTime: slotStartTime,
          endTime: slotEndTime,
          isBooked: false,
          isExpired: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
    console.log(newSlots);
    if (newSlots.length > 0) {
      await this.prisma.slots.createMany({ data: newSlots });
    }

    return plainToClass(RoomEntity, createdRoom);
  }

  async updateRoom(
    id: string,
    roomData: UpdateRoomDto & { updateDays?: number[] },
  ): Promise<RoomEntity> {
    // Step 1: Cek apakah room-nya ada
    const existingRoom = await this.prisma.rooms.findUnique({ where: { id } });
    if (!existingRoom) {
      throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
    }

    // Step 2: Update room (data utama)
    const updatedRoom = await this.prisma.rooms.update({
      where: { id },
      data: {
        name: roomData.name,
        floor: roomData.floor,
        capacity: roomData.capacity,
        startTime: roomData.startTime,
        endTime: roomData.endTime,
      },
    });

    // Step 3: Hitung jam baru untuk slot
    const startHour = parseInt(updatedRoom.startTime.split(':')[0], 10);
    const endHour = parseInt(updatedRoom.endTime.split(':')[0], 10);

    // Step 4: Tentukan hari mana yang mau diupdate
    const today = new Date();

    const updateDays = roomData.updateDays ?? [1, 2, 3]; // Default update 3 hari
    const datesToUpdate = updateDays.map((dayOffset) => {
      const date = new Date(today);
      date.setDate(today.getDate() + (dayOffset - 1));
      return date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    });

    // Step 5: Loop tiap tanggal yang mau diupdate
    for (const date of datesToUpdate) {
      // Optional filter createdAt di rentang 00:00 - 23:59
      const startOfDay = new Date(`${date}T00:00:00Z`);
      const endOfDay = new Date(`${date}T23:59:59Z`);

      // Ambil semua slot untuk room + tanggal tersebut (by 'date')
      const existingSlots = await this.prisma.slots.findMany({
        where: {
          roomId: id,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      // Step 6: Buat slot time baru berdasarkan startHour-endHour
      const newSlotTimes = [];
      for (let hour = startHour; hour < endHour; hour++) {
        const slotStartTime = `${hour.toString().padStart(2, '0')}:00`;
        const slotEndTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
        newSlotTimes.push({ startTime: slotStartTime, endTime: slotEndTime });
      }

      // Step 7: Tambah slot yang belum ada
      for (const newSlot of newSlotTimes) {
        const alreadyExists = existingSlots.find(
          (slot) =>
            slot.startTime === newSlot.startTime &&
            slot.endTime === newSlot.endTime,
        );

        if (!alreadyExists) {
          await this.prisma.slots.create({
            data: {
              id: crypto.randomUUID(),
              roomId: id,
              date: startOfDay.toISOString(), // Gunakan startOfDay
              startTime: newSlot.startTime,
              endTime: newSlot.endTime,
              isBooked: false,
              isExpired: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
        }
      }

      // Step 8: Hapus slot yang nggak termasuk di newSlotTimes
      for (const slot of existingSlots) {
        const stillExists = newSlotTimes.find(
          (s) => s.startTime === slot.startTime && s.endTime === slot.endTime,
        );

        if (!stillExists) {
          if (!slot.isBooked) {
            await this.prisma.slots.delete({
              where: { id: slot.id },
            });
          } else {
            console.warn(
              `Slot ${slot.id} di tanggal ${date} tidak dihapus karena sudah dibooking`,
            );
          }
        }
      }
    }

    return plainToClass(RoomEntity, updatedRoom);
  }

  async deleteRoom(id: string): Promise<string> {
    try {
      const existingRoom = await this.prisma.rooms.findUnique({
        where: { id },
      });
      if (!existingRoom) {
        throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
      }
      await this.prisma.rooms.delete({
        where: { id },
      });
      return `Room with ID ${id} has been successfully deleted.`;
    } catch (error) {
      throw new HttpException(
        `Failed to delete room with ID ${id}: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
