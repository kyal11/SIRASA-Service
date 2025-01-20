import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { SlotEntity } from './serialization/slot.entity';
import { plainToClass, plainToInstance } from 'class-transformer';
import { CreateSlotDto } from './validation/createSlot.dto';
import { UpdateSlotDto } from './validation/updateSlot.dto';

@Injectable()
export class SlotService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllSlot(): Promise<SlotEntity[]> {
    const slots = await this.prisma.slots.findMany({
      include: {
        room: true,
      },
    });
    return slots.map((slot) =>
      plainToInstance(
        SlotEntity,
        {
          ...slot,
          roomName: slot.room?.name,
        },
        { excludeExtraneousValues: true },
      ),
    );
  }

  async getSlotById(id: string): Promise<SlotEntity> {
    const slot = await this.prisma.slots.findUnique({
      where: { id },
      include: {
        room: true,
      },
    });

    if (!slot) {
      throw new NotFoundException(`Slot with ID ${id} not found`);
    }

    return plainToInstance(
      SlotEntity,
      {
        ...slot,
        roomName: slot.room?.name,
      },
      { excludeExtraneousValues: true },
    );
  }

  async createSlot(data: CreateSlotDto): Promise<SlotEntity> {
    try {
      const slot = await this.prisma.slots.create({
        data: {
          roomId: data.roomId,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
        },
      });

      return plainToClass(SlotEntity, slot);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateSlot(id: string, data: UpdateSlotDto): Promise<SlotEntity> {
    const existingSlot = await this.prisma.slots.findUnique({ where: { id } });

    if (!existingSlot) {
      throw new NotFoundException(`Slot with ID ${id} not found`);
    }

    const updatedSlot = await this.prisma.slots.update({
      where: { id },
      data,
    });

    return plainToClass(SlotEntity, updatedSlot);
  }

  async deleteSlot(id: string): Promise<string> {
    const existingSlot = await this.prisma.slots.findUnique({ where: { id } });

    if (!existingSlot) {
      throw new NotFoundException(`Slot with ID ${id} not found`);
    }

    await this.prisma.slots.delete({ where: { id } });

    return `Slot with ID ${id} has been successfully deleted`;
  }

  async updateBookingSlot(id: string): Promise<SlotEntity> {
    const existingSlot = await this.prisma.slots.findUnique({ where: { id } });

    if (!existingSlot) {
      throw new NotFoundException(`Slot with ID ${id} not found`);
    }

    if (existingSlot.isBooked) {
      throw new BadRequestException(`Slot with ID ${id} is already booked`);
    }

    const updatedSlot = await this.prisma.slots.update({
      where: { id },
      data: { isBooked: true },
    });

    return plainToClass(SlotEntity, updatedSlot);
  }
  async updateCancelSlot(id: string): Promise<SlotEntity> {
    const existingSlot = await this.prisma.slots.findUnique({ where: { id } });

    if (!existingSlot) {
      throw new NotFoundException(`Slot with ID ${id} not found`);
    }

    const updatedSlot = await this.prisma.slots.update({
      where: { id },
      data: { isBooked: false },
    });

    return plainToClass(SlotEntity, updatedSlot);
  }
}
