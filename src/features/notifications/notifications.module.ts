import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import * as firebase from 'firebase-admin';
import { PrismaService } from 'src/config/prisma/prisma.service';

@Module({
  providers: [NotificationsService, PrismaService],
  exports: [NotificationsService],
})
export class NotificationsModule {
  constructor() {
    firebase.initializeApp({
      credential: firebase.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
}
