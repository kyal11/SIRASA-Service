import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Inject, Injectable } from '@nestjs/common';
import { EmailService } from 'src/config/email/email.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Processor('queue-email')
@Injectable()
export class EmailProcessor {
  constructor(
    private readonly emailService: EmailService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Process('validate-account')
  async sendVerifiedEmail(
    job: Job<{ email: string; name: string; verifyUrl: string }>,
  ) {
    const { email, name, verifyUrl } = job.data;

    try {
      this.logger.info(
        `📨 [Job ID: ${job.id}] Memproses email verifikasi untuk: ${email}`,
      );

      await this.emailService.sendVerifyEmail(email, name, verifyUrl);

      this.logger.info(
        `✅ [Job ID: ${job.id}] Email verifikasi terkirim ke: ${email}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ [Job ID: ${job.id}] Gagal mengirim email verifikasi ke ${email}: ${error.message}`,
        {
          jobId: job.id,
          email,
          error,
        },
      );
      throw error;
    }
  }

  @Process('reset-password')
  async sendResetPasswordEmail(
    job: Job<{ email: string; name: string; resetUrl: string }>,
  ) {
    const { email, name, resetUrl } = job.data;

    try {
      this.logger.info(
        `📨 [Job ID: ${job.id}] Memproses email reset password untuk: ${email}`,
      );

      await this.emailService.sendEmailResetPassword(email, name, resetUrl);

      this.logger.info(
        `✅ [Job ID: ${job.id}] Email reset password terkirim ke: ${email}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ [Job ID: ${job.id}] Gagal mengirim email reset password ke ${email}: ${error.message}`,
        {
          jobId: job.id,
          email,
          error,
        },
      );
      throw error;
    }
  }
}
