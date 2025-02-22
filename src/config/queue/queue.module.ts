import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { EmailProcessor } from 'src/common/job/email-processor';
import { EmailService } from '../email/email.service';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'queue-email',
      useFactory: () => ({
        redis: {
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'fixed',
            delay: 5000,
          },
        },
      }),
    }),
  ],
  providers: [QueueService, EmailProcessor, EmailService],
  exports: [QueueService, BullModule],
})
export class QueueModule {}
