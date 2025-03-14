import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingEntity } from './serilization/booking.entity';
import { CreateBookingDto } from './validation/createBooking.dto';
import { UpdateBookingDto } from './validation/updateBooking.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/common/roles/roles.decorator';
import { RolesGuard } from 'src/common/roles/roles.guard';
import { PaginatedOutputDto } from 'src/common/paginate/paginated-output.dto';
import { RecommendationEntity } from 'src/features/recommendationRoom/serilization/recommendation.entity';
import { ApiResponse } from '../../common/api-response.entity';
import { DashboardBookingService } from './dashboard-booking.service';

@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'bookings', version: '1' })
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly dashboardBookingService: DashboardBookingService,
  ) {}

  @Get()
  async getAllBooking(): Promise<BookingEntity[]> {
    return this.bookingService.getAllBooking();
  }

  @Get('paginate')
  async getPaginatedBookings(
    @Query('page') page: string = '1',
    @Query('perPage') perPage: string = '10',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: 'cancel' | 'booked' | 'done',
  ): Promise<PaginatedOutputDto<BookingEntity>> {
    const pageNumber = isNaN(parseInt(page, 10)) ? 1 : parseInt(page, 10);
    const perPageNumber = isNaN(parseInt(perPage, 10))
      ? 10
      : parseInt(perPage, 10);

    return this.bookingService.getAllBookingPaginate(
      pageNumber,
      perPageNumber,
      startDate,
      endDate,
      status,
    );
  }

  @Get('history')
  async getUserHistory(@Req() req: any) {
    const userId = req.user.userId;
    console.log(`GET /history called by userId: ${req.user?.userId}`);
    console.log(`userId: ${userId}`);
    return await this.bookingService.getUserHistoryBooking(userId);
  }

  @Get('history/active')
  async getActiveHistory(@Req() req: any) {
    const userId = req.user.userId;
    console.log(`GET /history/active called by userId: ${req.user?.userId}`);
    console.log(`userId: ${userId}`);
    return await this.bookingService.getUserActiveBooking(userId);
  }

  @Get('history/paginate')
  async getUserHistoryPaginate(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('perPage') perPage: string = '10',
  ) {
    const userId = req.user.userId;
    const pageNumber = parseInt(page, 10);
    const perPageNumber = parseInt(perPage, 10);

    return await this.bookingService.getUserHistoryBookingPaginate(
      userId,
      pageNumber,
      perPageNumber,
    );
  }

  @Get('history/active/paginate')
  async getUserActiveHistoryPaginate(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('perPage') perPage: string = '10',
  ) {
    const userId = req.user.userId;
    const pageNumber = parseInt(page, 10);
    const perPageNumber = parseInt(perPage, 10);

    return await this.bookingService.getUserActiveBookingPaginate(
      userId,
      pageNumber,
      perPageNumber,
    );
  }
  @Get('summary')
  async getSummaryBooking(@Query('day') day?: string): Promise<
    ApiResponse<{
      totalBookings: number;
      canceledBookings: number;
      bookedBookings: number;
      doneBookings: number;
      totalRooms: number;
    }>
  > {
    const dayFilter = day ? parseInt(day, 10) : undefined;
    return this.dashboardBookingService.countBooking(dayFilter);
  }
  @Get(':id')
  async getBookingWithId(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BookingEntity> {
    return this.bookingService.getBookingWithId(id);
  }

  @Post()
  @SetMetadata('message', 'Booking success crated!')
  async createBooking(
    @Req() req: any,
    @Body() data: CreateBookingDto,
  ): Promise<ApiResponse<BookingEntity | RecommendationEntity[]>> {
    const userId = req.user.userId;
    return this.bookingService.createBooking(userId, data);
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
