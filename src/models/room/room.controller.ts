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
  Query,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './validation/create-room.dto';
import { UpdateRoomDto } from './validation/update-room.dto';
import { RoomEntity } from './serialization/room.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller({ path: 'rooms', version: '1' })
@UseGuards(AuthGuard('jwt'))
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  async getAllRooms(): Promise<RoomEntity[]> {
    return this.roomService.getAllRoom();
  }

  @Get('slots')
  async getAllRoomsWithSlots(
    @Query('day') day?: string,
  ): Promise<RoomEntity[]> {
    const filter = day ? parseInt(day, 10) : undefined;
    return this.roomService.getAllRoomWithSlot(filter);
  }

  @Get(':id')
  async getRoomById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('day') day?: string,
  ): Promise<RoomEntity> {
    const filter = day ? parseInt(day, 10) : undefined;
    return this.roomService.getRoomById(id, filter);
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
    @Body() roomData: UpdateRoomDto & { updateDays?: number[] },
  ): Promise<RoomEntity> {
    return this.roomService.updateRoom(id, roomData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteRoom(@Param('id') id: string): Promise<void> {
    await this.roomService.deleteRoom(id);
  }
}
