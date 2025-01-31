import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { FileService } from 'src/config/upload/file-service';

@Module({
  providers: [UsersService, PrismaService, FileService],
  controllers: [UsersController],
})
export class UsersModule {}
