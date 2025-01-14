import {
  Controller,
  HttpStatus,
  HttpCode,
  Post,
  SetMetadata,
  Body,
  Req,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './validation/login.dto';
import { RegisterDto } from './validation/register.dto';
import { ExceptionsFilter } from '../../common/filters/exception.filter';
import { AuthGuard } from '@nestjs/passport';

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
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req: Request) {
    const token = req.headers['authorization']?.split(' ')[1];
    return await this.AuthService.logout(token);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @SetMetadata('message', 'Token refreshed successfully')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refreshToken(@Req() req: any) {
    const userId = req.user.userId;
    console.log(req.user);
    return await this.AuthService.refreshToken(userId);
  }

  @Post('send-email-reset-password')
  @HttpCode(HttpStatus.OK)
  @SetMetadata('message', 'Email reset password succes to sending')
  async sendEmailResetPassword(@Body('email') email: string) {
    return await this.AuthService.sendEmailResetPassword(email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @SetMetadata('message', 'Reset Password Succesfully')
  @UseGuards(AuthGuard('token-reset-password'))
  async resetPassword(
    @Query('token') token: string,
    @Body('password') password: string,
    @Body('passwordConfirm') passwordConfirm: string,
    @Req() req: any,
  ) {
    const email = req.user.email;
    return await this.AuthService.resetPassword(
      email,
      password,
      passwordConfirm,
    );
  }

  @Post('send-validate-email')
  @HttpCode(HttpStatus.OK)
  @SetMetadata('message', 'Email validate account to sending')
  async sendValidateEmail(@Body('email') email: string) {
    return await this.AuthService.sendValidateEmail(email);
  }

  @Post('validate-email')
  @HttpCode(HttpStatus.OK)
  @SetMetadata('message', 'Verify account Succesfully')
  @UseGuards(AuthGuard('token-validate-email'))
  async validateEmail(@Query('token') token: string, @Req() req: any) {
    const email = req.user.email;
    return await this.AuthService.validateEmail(email);
  }
}
