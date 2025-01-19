import { Module } from '@nestjs/common';
import { RoomService } from '../room/room.service';
import { SlotService } from '../slotRoom/slot.service';
import { BookingService } from './booking.service';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { BookingController } from './booking.controller';

@Module({
  providers: [RoomService, SlotService, BookingService, PrismaService],
  controllers: [BookingController],
})
export class BookingModule {}
