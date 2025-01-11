import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './models/users/users.module';
import { UsersService } from './models/users/users.service';
import { PrismaService } from './config/prisma/prisma.service';
import { FileService } from './config/upload/fileService';
import { AuthController } from './features/authentication/auth.controller';
import { AuthService } from './features/authentication/auth.service';
import { AuthModule } from './features/authentication/auth.module';
import { JwtStrategy } from './common/jwt/jwtStrategy';

@Module({
  imports: [UsersModule, AuthModule],
  controllers: [AppController, AuthController],
  providers: [
    AppService,
    UsersService,
    PrismaService,
    FileService,
    AuthService,
    JwtStrategy,
  ],
})
export class AppModule {}
