import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { SlotService } from './slot.service';
import { SlotEntity } from './serialization/slot.entity';
import { CreateSlotDto } from './validation/createSlot.dto';
import { UpdateSlotDto } from './validation/updateSlot.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('slots')
@UseGuards(AuthGuard('jwt'))
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  @Get()
  async getAllSlots(): Promise<SlotEntity[]> {
    return this.slotService.getAllSlot();
  }

  @Get(':id')
  async getSlotById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SlotEntity> {
    return this.slotService.getSlotById(id);
  }

  @Post()
  async createSlot(@Body() slotData: CreateSlotDto): Promise<SlotEntity> {
    return this.slotService.createSlot(slotData);
  }

  @Put(':id')
  async updateSlot(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() slotData: UpdateSlotDto,
  ): Promise<SlotEntity> {
    return this.slotService.updateSlot(id, slotData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteSlot(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.slotService.deleteSlot(id);
  }

  @Put(':id/book')
  async bookSlot(@Param('id', ParseUUIDPipe) id: string): Promise<SlotEntity> {
    return this.slotService.updateBookingSlot(id);
  }

  @Put(':id/cancel')
  async cancelBooking(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SlotEntity> {
    return this.slotService.updateCancelSlot(id);
  }
}
