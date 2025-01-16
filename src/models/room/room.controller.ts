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
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './validation/createRoom.dto';
import { UpdateRoomDto } from './validation/updateRoom.dto';
import { RoomEntity } from './serialization/room.entity';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  async getAllRooms(): Promise<RoomEntity[]> {
    return this.roomService.getAllRoom();
  }

  @Get('slots')
  async getAllRoomsWithSlots(): Promise<RoomEntity[]> {
    return this.roomService.getAllRoomWithSlot();
  }

  @Post()
  async createRoom(@Body() roomData: CreateRoomDto): Promise<RoomEntity> {
    return this.roomService.createRoom(roomData);
  }

  @Post('slots')
  async createRoomWithSlots(
    @Body() roomData: CreateRoomDto,
  ): Promise<RoomEntity> {
    return this.roomService.createRoomWithSlot(roomData);
  }

  @Put(':id')
  async updateRoom(
    @Param('id') id: string,
    @Body() roomData: UpdateRoomDto,
  ): Promise<RoomEntity> {
    return this.roomService.updateRoom(id, roomData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRoom(@Param('id') id: string): Promise<void> {
    await this.roomService.deleteRoom(id);
  }
}
