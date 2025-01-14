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
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto } from './validation/createUser.dto';
import { UpdateUserDto } from './validation/updateUser.dto';
import { UsersService } from './users.service';
import { SetMetadata } from '@nestjs/common/decorators';
import { ExceptionsFilter } from '../../common/filters/exception.filter';
import { UserEntity } from './serialization/user.entity';
import { PaginatedOutputDto } from 'src/common/paginate/paginatedOutput.dto';

@Controller('users')
@UseFilters(ExceptionsFilter)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @SetMetadata('message', 'Users retrieved successfully')
  async getAllUsers() {
    return await this.usersService.getAllUsers();
  }

  @Get('paginate')
  async getPaginatedUsers(
    @Query('page') page: string = '1',
    @Query('perPage') perPage: string = '10',
  ): Promise<PaginatedOutputDto<UserEntity>> {
    const pageNumber = parseInt(page, 10);
    const perPageNumber = parseInt(perPage, 10);
    return this.usersService.getAllUsersPaginate(pageNumber, perPageNumber);
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
