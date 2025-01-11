import {
  Controller,
  HttpStatus,
  HttpCode,
  Post,
  SetMetadata,
  Body,
  UseFilters,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './validation/login.dto';
import { RegisterDto } from './validation/register.dto';
import { ExceptionsFilter } from '../../common/filters/exception.filter';

@Controller('')
@UseFilters(ExceptionsFilter)
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @SetMetadata('message', 'User registered successfully')
  async register(@Body() registerDto: RegisterDto) {
    return await this.AuthService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @SetMetadata('message', 'User logged in successfully')
  async login(@Body() loginDto: LoginDto) {
    return await this.AuthService.login(loginDto);
  }
}
