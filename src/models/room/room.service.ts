import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RoomEntity } from './serialization/room.entity';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { plainToClass } from 'class-transformer';
import { CreateRoomDto } from './validation/createRoom.dto';
import { UpdateRoomDto } from './validation/updateRoom.dto';

@Injectable()
export class RoomService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllRoom(): Promise<RoomEntity[]> {
    const roomData = await this.prisma.rooms.findMany();
    return roomData.map((data) => plainToClass(RoomEntity, data));
  }

  async getAllRoomWithSlot(): Promise<RoomEntity[]> {
    const roomData = await this.prisma.rooms.findMany({
      include: {
        slots: true,
      },
    });
    return roomData.map((data) => plainToClass(RoomEntity, data));
  }

  async getRoomById(id: string): Promise<RoomEntity> {
    const existingRoom = await this.prisma.rooms.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingRoom) {
      throw new HttpException('Data Room not found!', HttpStatus.BAD_REQUEST);
    }

    return plainToClass(RoomEntity, existingRoom);
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
      include: {
        slots: true,
      },
    });
    return plainToClass(RoomEntity, createdRoom);
  }

  async updateRoom(id: string, roomData: UpdateRoomDto): Promise<RoomEntity> {
    const existingRoom = await this.prisma.rooms.findUnique({ where: { id } });
    if (!existingRoom) {
      throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
    }

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
