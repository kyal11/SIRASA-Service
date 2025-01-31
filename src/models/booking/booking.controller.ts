import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingEntity } from './serilization/booking.entity';
import { CreateBookingDto } from './validation/createBooking.dto';
import { UpdateBookingDto } from './validation/updateBooking.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/common/roles/roles.decorator';
import { RolesGuard } from 'src/common/roles/roles.guard';

@Controller({ path: 'bookings', version: '1' })
@UseGuards(AuthGuard('jwt'))
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  async getAllBooking(): Promise<BookingEntity[]> {
    return this.bookingService.getAllBooking();
  }

  @Get(':id')
  async getBookingWithId(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BookingEntity> {
    return this.bookingService.getBookingWithId(id);
  }

  @Post()
  async createBooking(@Body() data: CreateBookingDto): Promise<BookingEntity> {
    return this.bookingService.createBooking(data);
  }

  @Put(':id')
  async updateBooking(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateBookingDto,
  ): Promise<BookingEntity> {
    return this.bookingService.updateBooking(id, data);
  }

  @Put(':id/done')
  @UseGuards(RolesGuard)
  @Roles('superadmin', 'admin')
  async updateStatusBooking(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BookingEntity> {
    const userIdAdmin = req.user.userId;
    return this.bookingService.updateStatusBooking(id, userIdAdmin);
  }

  @Put(':id/cancel')
  async updateCancelBooking(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BookingEntity> {
    return this.bookingService.updateCancelBoking(id);
  }

  @Delete(':id')
  async deleteBooking(@Param('id', ParseUUIDPipe) id: string): Promise<string> {
    return this.bookingService.deleteBooking(id);
  }
}
