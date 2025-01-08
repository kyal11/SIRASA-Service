import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { RegisterDto } from './validation/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

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
    
  }
}
