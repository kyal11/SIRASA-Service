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
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto } from './validation/create-user.dto';
import { UpdateUserDto } from './validation/update-user.dto';
import {
  Header,
  Req,
  Res,
  SetMetadata,
  UseGuards,
} from '@nestjs/common/decorators';
import { Response } from 'express';
import { UserEntity } from './serialization/user.entity';
import { PaginatedOutputDto } from 'src/common/paginate/paginated-output.dto';
import { RolesGuard } from 'src/common/roles/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/common/roles/roles.decorator';
import { UsersService } from './users.service';
import { UsersExportsService } from 'src/features/exports/users-exports.service';

@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userExportService: UsersExportsService,
  ) {}

  @Get()
  @SetMetadata('message', 'Users retrieved successfully')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('superadmin', 'admin')
  async getAllUsers(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.usersService.getAllUsers(startDate, endDate);
  }

  @Get('paginate')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('superadmin', 'admin')
  async getPaginatedUsers(
    @Query('page') page: string = '1',
    @Query('perPage') perPage: string = '10',
    @Query('search') search?: string,
    @Query('role') role?: string,
  ): Promise<PaginatedOutputDto<UserEntity>> {
    const pageNumber = parseInt(page, 10);
    const perPageNumber = parseInt(perPage, 10);
    return this.usersService.getAllUsersPaginate(
      pageNumber,
      perPageNumber,
      search,
      role,
    );
  }

  @Get('detail')
  @SetMetadata('message', 'User details retrieved successfully')
  @UseGuards(AuthGuard('jwt'))
  async getUserDetail(@Req() req: any) {
    const userId = req.user.userId;
    return await this.usersService.getUsersById(userId);
  }
  @Get('export/excel')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('superadmin', 'admin')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async exportUsersToExcel(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const buffer = await this.userExportService.exportUsersToExcel(
      startDate,
      endDate,
    );
    res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
    res.send(buffer);
  }

  @Get('export/csv')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('superadmin', 'admin')
  @Header('Content-Type', 'text/csv')
  async exportUsersToCsv(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filePath = await this.userExportService.exportUsersToCsv(
      startDate,
      endDate,
    );
    res.download(filePath);
  }
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @SetMetadata('message', 'User created successfully')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('superadmin, admin')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.createUser(createUserDto);
  }

  @Get(':id')
  @SetMetadata('message', 'User details retrieved successfully')
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.usersService.getUsersById(id);
  }

  @Put('')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image_url'))
  @SetMetadata('message', 'Account updated successfully')
  @UseGuards(AuthGuard('jwt'))
  async updateAccountUser(
    @Req() req: any,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req.user.userId;
    return await this.usersService.updateUser(userId, updateUserDto, file);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image_url'))
  @SetMetadata('message', 'User updated successfully')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('superadmin', 'admin')
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('superadmin')
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return await this.usersService.deleteUser(id);
  }
}
