import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './models/users/users.module';
import { UsersService } from './models/users/users.service';
import { PrismaService } from './config/prisma/prisma.service';
import { FileService } from './config/upload/fileService';

@Module({
  imports: [UsersModule],
  controllers: [AppController],
  providers: [AppService, UsersService, PrismaService, FileService],
})
export class AppModule {}
