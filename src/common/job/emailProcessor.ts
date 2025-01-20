import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { EmailService } from 'src/config/email/email.service';

@Processor('queue-email')
export class EmailProcessor {
  constructor(private readonly emailService: EmailService) {}

  @Process('validate-account')
  async sendVerifiedEmail(
    job: Job<{ email: string; name: string; verifyUrl: string }>,
  ) {
    const { email, name, verifyUrl } = job.data;
    console.log(`Processing validation email for: ${email}`);
    await this.emailService.sendVerifyEmail(email, name, verifyUrl);
  }

  @Process('reset-password')
  async sendResetPasswordEmail(
    job: Job<{ email: string; name: string; resetUrl: string }>,
  ) {
    const { email, name, resetUrl } = job.data;
    console.log(`Processing password reset email for: ${email}`);
    await this.emailService.sendEmailResetPassword(email, name, resetUrl);
  }
}
