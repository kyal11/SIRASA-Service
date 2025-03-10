import { Module } from '@nestjs/common';
import { RoomService } from '../room/room.service';
import { SlotService } from '../slotRoom/slot.service';
import { BookingService } from './booking.service';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { BookingController } from './booking.controller';
import { NotificationsModule } from 'src/features/notifications/notifications.module';
import { GreedyRecommendation } from 'src/features/recommendationRoom/greedy-recommendation';
import { DashboardBookingService } from './dashboard-booking.service';

@Module({
  imports: [NotificationsModule],
  providers: [
    RoomService,
    SlotService,
    BookingService,
    DashboardBookingService,
    PrismaService,
    GreedyRecommendation,
  ],
  controllers: [BookingController],
})
export class BookingModule {}
