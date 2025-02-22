import { InjectQueue } from '@nestjs/bull';
import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('queue-email') private queueEmail: Queue,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async addJobEmail(jobType: 'validate-account' | 'reset-password', data: any) {
    try {
      this.logger.info(`📩 Menambahkan job email: ${jobType} ke dalam queue`, {
        jobType,
        data,
      });

      await this.queueEmail.add(jobType, data);

      this.logger.info(`✅ Job email '${jobType}' berhasil ditambahkan`);
    } catch (error) {
      this.logger.error(
        `❌ Gagal menambahkan job email '${jobType}': ${error.message}`,
        {
          jobType,
          error,
        },
      );
      throw error;
    }
  }
}
