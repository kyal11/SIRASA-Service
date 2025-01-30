import { Injectable } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import { PrismaService } from 'src/config/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async sendNotification(
    title: string,
    message: string,
    recipient: string | string[],
    icon?: string,
  ): Promise<void> {
    if (Array.isArray(recipient) && recipient.length > 1) {
      await this.sendMultipleNotifications(title, message, recipient, icon);
    } else {
      const token = Array.isArray(recipient) ? recipient[0] : recipient;
      const notificationPayload: any = {
        notification: {
          title,
          body: message,
        },
        token: token,
      };

      if (icon) {
        notificationPayload.notification.icon = icon;
      }

      try {
        await firebase.messaging().send(notificationPayload);
        console.log('Notification sent successfully:', notificationPayload);
      } catch (error) {
        console.error('Error sending notification:', error);
        if (error.code === 'messaging/registration-token-not-registered') {
          await this.removeInvalidToken(token);
        }
      }
    }
  }
  async sendMultipleNotifications(
    title: string,
    message: string,
    recipients: string[],
    icon?: string,
  ): Promise<void> {
    if (recipients.length === 0) {
      console.warn('No recipients provided for notification');
      return;
    }

    const notificationPayload: any = {
      notification: {
        title,
        body: message,
        ...(icon && { icon }),
      },
      tokens: recipients,
    };

    try {
      const response = await firebase
        .messaging()
        .sendEachForMulticast(notificationPayload);
      console.log('Multiple notifications sent successfully:', response);
      response.responses.forEach(async (res, index) => {
        if (
          !res.success &&
          res.error?.code === 'messaging/registration-token-not-registered'
        ) {
          await this.removeInvalidToken(recipients[index]);
        }
      });
    } catch (error) {
      console.error('Error sending multiple notifications:', error);
    }
  }

  async notifyBookingConfirmation(
    recipient: string | string[],
    roomName: string,
    bookingDate: string,
    timeSlot: string,
    icon?: string,
  ): Promise<void> {
    const message = `Peminjaman Anda berhasil! ${roomName} telah dipesan untuk tanggal ${bookingDate}, pukul ${timeSlot}. Silakan validasi QR code Anda sebelum ${this.calculateDeadline(timeSlot)} untuk menghindari pembatalan otomatis.`;
    await this.sendNotification(
      'Konfirmasi Peminjaman',
      message,
      recipient,
      icon,
    );
  }
  async notifyBookingCanceled(
    recipient: string | string[],
    roomName: string,
    icon?: string,
  ): Promise<void> {
    const message = `Peminjaman Anda pada ${roomName} berhasil dibatalkan`;
    await this.sendNotification(
      'Peminjaman Dibatalkan',
      message,
      recipient,
      icon,
    );
  }
  async notifyBookingReminder(
    recipient: string | string[],
    roomName: string,
    timeSlot: string,
    icon?: string,
  ): Promise<void> {
    const message = `Jangan lupa, Anda memiliki peminjaman ${roomName} pukul ${timeSlot}. Harap datang tepat waktu dan validasi QR code Anda sebelum ${this.calculateDeadline(timeSlot)}.`;
    await this.sendNotification(
      'Pengingat Peminjaman',
      message,
      recipient,
      icon,
    );
  }

  async notifyValidationDeadline(
    recipient: string | string[],
    roomName: string,
    deadline: string,
    icon?: string,
  ): Promise<void> {
    const message = `Harap segera validasi QR code Anda untuk ${roomName} sebelum pukul ${deadline}, atau peminjaman akan dibatalkan otomatis.`;
    await this.sendNotification(
      'Batas Waktu Validasi',
      message,
      recipient,
      icon,
    );
  }

  async notifyAutomaticCancellation(
    recipient: string | string[],
    roomName: string,
    timeSlot: string,
    icon?: string,
  ): Promise<void> {
    const message = `Peminjaman Anda untuk ${roomName} pukul ${timeSlot} telah dibatalkan karena Anda tidak memvalidasi QR code tepat waktu.`;
    await this.sendNotification(
      'Pembatalan Otomatis',
      message,
      recipient,
      icon,
    );
  }

  async notifyEndTimeReminder(
    recipient: string | string[],
    roomName: string,
    remainingTime: number,
    icon?: string,
  ): Promise<void> {
    const message = `Waktu peminjaman Anda untuk ${roomName} akan berakhir dalam ${remainingTime} menit. Harap selesaikan kegiatan Anda.`;
    await this.sendNotification(
      'Pengingat Sisa Waktu',
      message,
      recipient,
      icon,
    );
  }
  async notifyUserQRValidation(
    recipent: string | string[],
    roomName: string,
    validationTime: string,
    studentName: string,
    icon?: string,
  ): Promise<void> {
    const message = `${studentName} anda telah berhasil memvalidasi QR code untuk ${roomName} pada pukul ${validationTime}.`;
    await this.sendNotification('Validasi QR Code', message, recipent, icon);
  }
  async notifyAdminNewBooking(
    adminToken: string,
    roomName: string,
    timeSlot: string,
    studentName: string,
    icon?: string,
  ): Promise<void> {
    const message = `Peminjaman baru: ${roomName} telah dipesan oleh ${studentName} untuk pukul ${timeSlot}.`;
    await this.sendNotification('Peminjaman Baru', message, adminToken, icon);
  }

  async notifyAdminQRValidation(
    adminToken: string | string[],
    roomName: string,
    validationTime: string,
    studentName: string,
    icon?: string,
  ): Promise<void> {
    const message = `${studentName} telah memvalidasi QR code untuk ${roomName} pada pukul ${validationTime}.`;
    await this.sendNotification('Validasi QR Code', message, adminToken, icon);
  }

  async notifyAdminUnusedRoom(
    adminToken: string | string[],
    roomName: string,
    timeSlot: string,
    icon?: string,
  ): Promise<void> {
    const message = `Peminjaman ${roomName} pukul ${timeSlot} telah dibatalkan otomatis karena pengguna tidak memvalidasi QR code.`;
    await this.sendNotification(
      'Peringatan Ruangan Tidak Digunakan',
      message,
      adminToken,
      icon,
    );
  }

  private calculateDeadline(timeSlot: string): string {
    const [startHour, startMinute] = timeSlot
      .split('-')[0]
      .split(':')
      .map(Number);
    const deadline = new Date();
    deadline.setHours(startHour);
    deadline.setMinutes(startMinute + 15);
    return `${deadline.getHours()}:${deadline.getMinutes().toString().padStart(2, '0')}`;
  }
  async removeInvalidToken(token: string): Promise<void> {
    try {
      await this.prisma.device_token.deleteMany({
        where: { token },
      });
      console.log(`Invalid token removed from database: ${token}`);
    } catch (error) {
      console.error('Error removing invalid token:', error);
    }
  }
}
