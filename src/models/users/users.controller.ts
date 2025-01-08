import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
  UseFilters,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UsersService } from './users.service';
import { SetMetadata } from '@nestjs/common/decorators';
import { ExceptionsFilter } from '../../common/filters/exception.filter';

@Controller('users')
@UseFilters(ExceptionsFilter)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @SetMetadata('message', 'Users retrieved successfully')
  async getAllUsers() {
    return await this.usersService.getAllUsers();
  }

  @Get(':id')
  @SetMetadata('message', 'User details retrieved successfully')
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.usersService.getUsersById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @SetMetadata('message', 'User created successfully')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.createUser(createUserDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image_url'))
  @SetMetadata('message', 'User updated successfully')
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.usersService.updateUser(id, updateUserDto, file);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @SetMetadata('message', 'User deleted successfully')
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return await this.usersService.deleteUser(id);
  }
}
