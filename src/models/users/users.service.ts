import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateUserDto } from './validation/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './validation/update-user.dto';
import { FileService } from 'src/config/upload/file-service';
import { plainToClass } from 'class-transformer';
import { UserEntity } from './serialization/user.entity';
import { PaginatedOutputDto } from 'src/common/paginate/paginated-output.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async getAllUsers(
    startDate?: string,
    endDate?: string,
  ): Promise<UserEntity[]> {
    const whereCondition: any = {};

    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && isNaN(start.getTime())) {
        throw new Error('Invalid startDate format. Use YYYY-MM-DD');
      }
      if (end && isNaN(end.getTime())) {
        throw new Error('Invalid endDate format. Use YYYY-MM-DD');
      }

      if (start && end && start.toDateString() === end.toDateString()) {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      } else {
        if (start) start.setHours(0, 0, 0, 0);
        if (end) end.setHours(23, 59, 59, 999);
      }

      whereCondition.createdAt = {};
      if (start) whereCondition.createdAt.gte = start;
      if (end) whereCondition.createdAt.lte = end;
    }

    const users = await this.prisma.users.findMany({
      where: whereCondition,
      include: {
        deviceTokens: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => plainToClass(UserEntity, user));
  }
  async getAllUsersPaginate(
    page: number = 1,
    perPage: number = 10,
    search?: string,
    role?: string,
  ): Promise<PaginatedOutputDto<UserEntity>> {
    const skip = (page - 1) * perPage;

    // Buat filter untuk Prisma berdasarkan parameter yang dikirim
    const filters: any = {};

    if (search) {
      filters.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      filters.role = role;
    }

    // Hitung total user dengan filter
    const total = await this.prisma.users.count({
      where: filters,
    });

    // Ambil data user dengan filter, pagination, dan sorting (misalnya terbaru dulu)
    const data = await this.prisma.users.findMany({
      where: filters,
      skip: skip,
      take: perPage,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Konversi ke DTO
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
