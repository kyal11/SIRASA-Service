import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { RegisterDto } from './validation/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './validation/login.dto';
import { JwtService } from '@nestjs/jwt';
import { plainToClass } from 'class-transformer';
import { AuthEntity } from './serialization/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
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

    const userEntity = plainToClass(AuthEntity, user);

    return userEntity.loginResponse(jwtToken, refreshToken);
  }
}
