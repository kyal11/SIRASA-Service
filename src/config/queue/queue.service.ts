import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('queue-email') private queueEmail: Queue) {}

  async addJobEmail(jobType: 'validate-account' | 'reset-password', data: any) {
    await this.queueEmail.add(jobType, data);
  }
}
