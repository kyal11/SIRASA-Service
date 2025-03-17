import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { FileService } from 'src/config/upload/file-service';
import { UsersExportsService } from 'src/features/exports/users-exports.service';

@Module({
  providers: [UsersService, PrismaService, FileService, UsersExportsService],
  controllers: [UsersController],
})
export class UsersModule {}
