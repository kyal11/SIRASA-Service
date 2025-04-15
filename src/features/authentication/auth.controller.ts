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
  Get,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './validation/login.dto';
import { RegisterDto } from './validation/register.dto';
import { ExceptionsFilter } from '../../common/filters/exception.filter';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from '../notifications/notifications.service';

@Controller({ version: '1' })
@UseFilters(ExceptionsFilter)
export class AuthController {
  constructor(
    private readonly AuthService: AuthService,
    private readonly NotificationsService: NotificationsService,
  ) {}

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
  async logout(
    @Headers('authorization') authHeader: string,
    @Body('deviceToken') deviceToken?: string,
  ) {
    const token = authHeader?.split(' ')[1];
    return await this.AuthService.logout(token, deviceToken);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @SetMetadata('message', 'Token refreshed successfully')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refreshToken(@Req() req: any) {
    const userId = req.user.userId;
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

  @Get('validate-email')
  @HttpCode(HttpStatus.OK)
  @SetMetadata('message', 'Verify account Succesfully')
  @UseGuards(AuthGuard('token-validate-email'))
  async validateEmail(@Query('token') token: string, @Req() req: any) {
    const email = req.user.email;
    return await this.AuthService.validateEmail(email);
  }

  @Post('notification')
  async sendNotif(
    @Body() body: { token: string; roomName: string; timeSlot: string },
  ) {
    const { token, roomName, timeSlot } = body;

    if (!token || !roomName || !timeSlot) {
      throw new Error(
        'Missing required parameters: token, roomName, or timeSlot',
      );
    }

    try {
      await this.NotificationsService.notifyBookingReminder(
        token,
        roomName,
        timeSlot,
      );
      return { message: 'Notification sent successfully' };
    } catch (error) {
      console.error('Error sending notification:', error);
      throw new Error(`Error sending notification: ${error.message}`);
    }
  }
}
