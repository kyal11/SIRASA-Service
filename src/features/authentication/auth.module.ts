import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from 'src/common/jwt/jwtStrategy';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { EmailService } from 'src/config/email/email.service';
import { TokenResetStrategy } from 'src/common/jwt/tokenResetStrategy';
import { TokenValidateStrategy } from 'src/common/jwt/tokenValidateStrategy';
import { JwtRefreshStrategy } from 'src/common/jwt/jwtRefreshStrategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '2d' },
    }),
  ],
  providers: [
    AuthService,
    PrismaService,
    JwtStrategy,
    JwtRefreshStrategy,
    EmailService,
    TokenResetStrategy,
    TokenValidateStrategy,
  ],
  exports: [AuthService, JwtModule, JwtStrategy],
})
export class AuthModule {}
