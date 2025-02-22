import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './models/users/users.module';
import { UsersService } from './models/users/users.service';
import { PrismaService } from './config/prisma/prisma.service';
import { FileService } from './config/upload/file-service';
import { AuthController } from './features/authentication/auth.controller';
import { AuthService } from './features/authentication/auth.service';
import { AuthModule } from './features/authentication/auth.module';
import { RedisModule } from './config/redis/redis.module';
import { RedisService } from './config/redis/redis.service';
import { EmailService } from './config/email/email.service';
import { RoomModule } from './models/room/room.module';
import { SlotModule } from './models/slotRoom/slot.module';
import { BookingService } from './models/booking/booking.service';
import { BookingController } from './models/booking/booking.controller';
import { BookingModule } from './models/booking/booking.module';
import { QueueModule } from './config/queue/queue.module';
import { QueueService } from './config/queue/queue.service';
import { NotificationsModule } from './features/notifications/notifications.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerJobModule } from './features/schedulerJob/scheduler-job.module';
import { SchedulerJobNotificationService } from './features/schedulerJob/scheduler-job-notifications.service';
import { SchedulerJobSlotService } from './features/schedulerJob/scheduler-job-slot.service';
import { GreedyRecommendation } from './features/recommendationRoom/greedy-recommendation';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    RedisModule,
    RoomModule,
    SlotModule,
    BookingModule,
    QueueModule,
    NotificationsModule,
    ScheduleModule.forRoot(),
    SchedulerJobModule,
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp }) => {
              return `[${timestamp}] ${level}: ${message}`;
            }),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/app.log',
          level: 'info',
        }),
      ],
    }),
  ],
  controllers: [AppController, AuthController, BookingController],
  providers: [
    AppService,
    UsersService,
    PrismaService,
    FileService,
    AuthService,
    RedisService,
    EmailService,
    BookingService,
    QueueService,
    SchedulerJobNotificationService,
    SchedulerJobSlotService,
    GreedyRecommendation,
  ],
})
export class AppModule {}
