import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateUserDto } from './validation/createUser.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './validation/updateUser.dto';
import { FileService } from 'src/config/upload/fileService';
import { plainToClass } from 'class-transformer';
import { UserEntity } from './serialization/user.entity';
import { PaginatedOutputDto } from 'src/common/paginate/paginatedOutput.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async getAllUsers(): Promise<UserEntity[]> {
    const users = await this.prisma.users.findMany();

    return users.map((user) => plainToClass(UserEntity, user));
  }
  async getAllUsersPaginate(
    page: number = 1,
    perPage: number = 10,
  ): Promise<PaginatedOutputDto<UserEntity>> {
    const total = await this.prisma.users.count();
    const skip = (page - 1) * perPage;
    const data = await this.prisma.users.findMany({
      skip: skip,
      take: perPage,
    });
    const users = data.map((user) => plainToClass(UserEntity, user));
    const lastPage = Math.ceil(total / perPage);

    return {
      data: users,
      meta: {
        total: total,
        lastPage: lastPage,
        currentPage: page,
        perPage: perPage,
        prev: page > 1 ? page - 1 : null,
        next: page < lastPage ? page + 1 : null,
      },
    };
  }

  async getUsersById(id: string): Promise<UserEntity> {
    const user = await this.prisma.users.findUnique({
      where: {
        id: id,
      },
    });
    return plainToClass(UserEntity, user);
  }
  async createUser(userData: CreateUserDto): Promise<UserEntity> {
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

    return plainToClass(UserEntity, newUser);
  }

  async updateUser(
    id: string,
    userData: UpdateUserDto,
    file?: Express.Multer.File,
  ): Promise<UserEntity> {
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

    let imageUrl = existingUser.imageUrl;
    if (file) {
      if (existingUser.imageUrl) {
        await this.fileService.deleteProfileImage(existingUser.imageUrl);
      }

      imageUrl = await this.fileService.uploadFileImage(file);
    }

    const updatedUser = await this.prisma.users.update({
      where: {
        id: id,
      },
      data: {
        ...anyData,
        imageUrl: imageUrl,
      },
    });

    return plainToClass(UserEntity, updatedUser);
  }

  async deleteUser(id: string): Promise<string> {
    const existingUser = await this.prisma.users.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    await this.prisma.users.delete({
      where: {
        id: id,
      },
    });
    if (existingUser.imageUrl !== null) {
      await this.fileService.deleteProfileImage(existingUser.imageUrl);
    }
    return 'User deleted successfully';
  }
}
