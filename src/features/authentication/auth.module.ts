import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from 'src/common/jwt/jwtStrategy';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { TokenResetStrategy } from 'src/common/jwt/tokenResetStrategy';
import { TokenValidateStrategy } from 'src/common/jwt/tokenValidateStrategy';
import { JwtRefreshStrategy } from 'src/common/jwt/jwtRefreshStrategy';
import { QueueService } from 'src/config/queue/queue.service';
import { QueueModule } from 'src/config/queue/queue.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '2d' },
    }),
    QueueModule,
  ],
  providers: [
    AuthService,
    PrismaService,
    JwtStrategy,
    JwtRefreshStrategy,
    TokenResetStrategy,
    TokenValidateStrategy,
    QueueService,
  ],
  exports: [AuthService, JwtModule, JwtStrategy],
})
export class AuthModule {}
