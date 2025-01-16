import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { PrismaService } from 'src/config/prisma/prisma.service';

@Module({
  providers: [RoomService, PrismaService],
  controllers: [RoomController],
})
export class RoomModule {}
