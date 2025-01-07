import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateUserDto } from './userDto/createUser.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './userDto/updateUser.dto';
import { FileService } from 'src/config/upload/fileService';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async getAllUsers() {
    return await this.prisma.users.findMany();
  }

  async getUsersById(id: string) {
    return await this.prisma.users.findUnique({
      where: {
        id: id,
      },
    });
  }
  async createUser(userData: CreateUserDto) {
    const { email, nim, password, role, ...anyData } = userData;

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

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.prisma.users.create({
      data: {
        ...anyData,
        email,
        nim,
        password: hashedPassword,
        role: role,
      },
    });

    return newUser;
  }

  async updateUser(
    id: string,
    userData: UpdateUserDto,
    file?: Express.Multer.File,
  ) {
    const { password, ...anyData } = userData;

    const existingUser = await this.prisma.users.findUnique({
      where: {
        id: id,
      },
    });
    if (!existingUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (password) {
      userData.password = await bcrypt.hash(password, 10);
    }

    let imageUrl = existingUser.image_url;
    if (file) {
      if (existingUser.image_url) {
        await this.fileService.deleteProfileImage(existingUser.image_url);
      }

      imageUrl = await this.fileService.uploadFileImage(file);
    }

    const updatedUser = await this.prisma.users.update({
      where: {
        id: id,
      },
      data: {
        ...anyData,
        image_url: imageUrl,
      },
    });

    return updatedUser;
  }

  async deleteUser(id: string) {
    const existingUser = await this.prisma.users.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (existingUser.image_url) {
      await this.fileService.deleteProfileImage(existingUser.image_url);
    }
    this.prisma.users.delete({
      where: {
        id: id,
      },
    });

    return 'User deleted successfully';
  }
}
