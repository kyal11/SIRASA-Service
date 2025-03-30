import { Injectable } from '@nestjs/common';
import { readFile } from 'fs/promises';
import Handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import { join } from 'path';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT),
      secure: process.env.MAIL_ENCRYPTION === 'true',
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
      to: to,
      subject: subject,
      html: html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email to ${to}: ${error.message}`);
    }
  }

  async sendEmailResetPassword(
    email: string,
    name: string,
    resetUrl: string,
  ): Promise<void> {
    try {
      const templatePath = join(
        __dirname,
        '../../mails/resetEmailTemplete.hbs',
      );
      console.log(`Loading email template from: ${templatePath}`);

      const source = await readFile(templatePath, 'utf8');
      const template = Handlebars.compile(source);
      const html = template({ name, resetUrl });
      console.log(email);
      console.log(`Sending password reset email to ${email}`);
      await this.sendMail(email, 'Reset Password Sirasa', html);
    } catch (error) {
      console.error('Error in sendEmailResetPassword:', error);
      throw new Error(`Failed to send reset password email: ${error.message}`);
    }
  }

  async sendVerifyEmail(
    email: string,
    name: string,
    verifyUrl: string,
  ): Promise<void> {
    try {
      const templatePath = join(
        __dirname,
        '../../mails/validateEmailTemplete.hbs',
      );
      console.log(`Loading email template from: ${templatePath}`);

      const source = await readFile(templatePath, 'utf8');
      const template = Handlebars.compile(source);
      const html = template({ name, verifyUrl });
      console.log(email);
      console.log(`Verify Email to ${email}`);
      await this.sendMail(email, 'Active & Verify your account', html);
    } catch (error) {
      console.error('Error in Verify Emai:', error);
      throw new Error(`Failed to Verify Emai ${error.message}`);
    }
  }
}
