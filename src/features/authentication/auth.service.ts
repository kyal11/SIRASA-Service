import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { RegisterDto } from './validation/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './validation/login.dto';
import { JwtService } from '@nestjs/jwt';
import { plainToClass } from 'class-transformer';
import { AuthEntity } from './serialization/auth.entity';
import { RedisService } from '../../config/redis/redis.service';
import { QueueService } from '../../config/queue/queue.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly queueService: QueueService,
  ) {}

  async register(userData: RegisterDto) {
    const { email, nim, password, passwordConfirm, ...anyData } = userData;

    const existingUserByEmail = await this.prisma.users.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUserByEmail) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }

    const existingUserByNim = await this.prisma.users.findUnique({
      where: {
        nim: nim,
      },
    });
    if (existingUserByNim) {
      throw new HttpException('NIM already exists', HttpStatus.BAD_REQUEST);
    }

    if (password !== passwordConfirm) {
      throw new HttpException('Password not match', HttpStatus.BAD_REQUEST);
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.users.create({
      data: {
        ...anyData,
        email: email,
        password: hashPassword,
        nim: nim,
      },
    });

    const userEntity = plainToClass(AuthEntity, user);

    return userEntity.registerResponse();
  }

  async login(loginDto: LoginDto) {
    const { email, nim, password } = loginDto;
    let user: any;

    if (email) {
      user = await this.prisma.users.findUnique({
        where: {
          email: email,
        },
      });
      if (!user) {
        throw new HttpException('Email not found', HttpStatus.NOT_FOUND);
      }
    }

    if (nim) {
      user = await this.prisma.users.findUnique({
        where: {
          nim: nim,
        },
      });
      if (!user) {
        throw new HttpException('NIM not found', HttpStatus.NOT_FOUND);
      }
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new HttpException('Password not match', HttpStatus.BAD_REQUEST);
    }

    const payloadJwt = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const jwtToken = this.jwtService.sign(payloadJwt);

    const refreshToken = this.jwtService.sign(payloadJwt, { expiresIn: '7d' });

    await this.redisService.set(
      'refreshToken:' + user.id,
      refreshToken,
      60 * 60 * 24 * 7,
    );
    const userEntity = plainToClass(AuthEntity, user);

    return userEntity.loginResponse(jwtToken);
  }

  async logout(token: string) {
    const isBlacklisted = await this.redisService.get('blacklist:' + token);

    if (isBlacklisted) {
      throw new HttpException(
        'Token already blacklisted',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.redisService.set(
      'blacklist:' + token,
      'blacklisted',
      60 * 60 * 24 * 7,
    );

    return 'Logout successfully';
  }

  async refreshToken(userId: string) {
    const storedRefreshToken = await this.redisService.get(
      `refreshToken:${userId}`,
    );

    console.log(userId);
    if (!storedRefreshToken) {
      throw new HttpException(
        'Invalid or expired refresh token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const payloadJwt = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = this.jwtService.sign(payloadJwt);
    const newRefreshToken = this.jwtService.sign(payloadJwt, {
      expiresIn: '7d',
    });

    await this.redisService.set(
      `refreshToken:${user.id}`,
      newRefreshToken,
      60 * 60 * 24 * 7,
    );

    const userEntity = plainToClass(AuthEntity, user);

    return userEntity.loginResponse(newAccessToken);
  }

  async sendEmailResetPassword(email: string): Promise<string> {
    const user = await this.prisma.users.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      throw new HttpException('Email not found', HttpStatus.NOT_FOUND);
    }
    const payload = { email: email };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_RESET_PASS,
      expiresIn: '1h',
    });

    const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;
    await this.queueService.addJobEmail('reset-password', {
      email: email,
      name: user.name,
      resetUrl: resetUrl,
    });
    return 'Send Email reset password in Process';
  }
  async resetPassword(
    email: string,
    password: string,
    passwordConfirm: string,
  ): Promise<string> {
    const user = await this.prisma.users.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      throw new HttpException(
        'Invalid token or user not found',
        HttpStatus.NOT_FOUND,
      );
    }
    if (password !== passwordConfirm) {
      throw new HttpException('Password not match', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.users.update({
      where: { email: email },
      data: { password: hashedPassword },
    });

    return 'Password reset successfully.';
  }

  async sendValidateEmail(email: string): Promise<string> {
    const user = await this.prisma.users.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      throw new HttpException('Email not found', HttpStatus.NOT_FOUND);
    }
    if (user.verified === true) {
      throw new HttpException('Email already verified', HttpStatus.NOT_FOUND);
    }
    const payload = { email: email };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_VALIDATE_EMAIL,
      expiresIn: '1h',
    });

    const validateUrl = `${process.env.APP_URL}/validate-email?token=${token}`;
    await this.queueService.addJobEmail('validate-account', {
      email: email,
      name: user.name,
      verifyUrl: validateUrl,
    });
    return 'Send Email validate account in Process';
  }
  async validateEmail(email: string) {
    const user = await this.prisma.users.findUnique({
      where: { email: email },
    });
    if (!user) {
      throw new HttpException(
        'Invalid token or user not found',
        HttpStatus.NOT_FOUND,
      );
    }
    if (user.verified === true) {
      throw new HttpException('Email already verified', HttpStatus.BAD_REQUEST);
    }
    await this.prisma.users.update({
      where: { email: email },
      data: { verified: true },
    });
    return { message: 'Email verified successfully.' };
  }
}
