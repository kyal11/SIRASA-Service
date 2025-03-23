import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { NotificationsService } from 'src/features/notifications/notifications.service';

@Module({
  providers: [RoomService, PrismaService, NotificationsService],
  controllers: [RoomController],
})
export class RoomModule {}
