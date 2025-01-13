import {
  Controller,
  HttpStatus,
  HttpCode,
  Post,
  SetMetadata,
  Body,
  Req,
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

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @SetMetadata('message', 'User logged out successfully')
  async logout(@Req() req: Request) {
    const token = req.headers['authorization']?.split(' ')[1];
    return await this.AuthService.logout(token);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @SetMetadata('message', 'Token refreshed successfully')
  async refreshToken(@Req() req: Request) {
    const token = req.headers['authorization']?.split(' ')[1];
    return await this.AuthService.refreshToken(token);
  }

  @Post('send-email-reset-password')
  @HttpCode(HttpStatus.OK)
  @SetMetadata('message', 'Email reset password succes to sending')
  async sendEmailResetPassword(@Body() body: { email: string }) {
    const { email } = body;
    return await this.AuthService.sendEmailResetPassword(email);
  }
}
