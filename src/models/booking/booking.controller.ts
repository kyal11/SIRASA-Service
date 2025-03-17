import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
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
import { BookingExportsService } from '../../features/exports/booking-exports.service';
import { Response } from 'express';

@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'bookings', version: '1' })
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly dashboardBookingService: DashboardBookingService,
    private readonly bookingExportsService: BookingExportsService,
  ) {}

  @Get()
  async getAllBooking(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<BookingEntity[]> {
    return this.bookingService.getAllBooking(startDate, endDate);
  }

  @Get('paginate')
  async getPaginatedBookings(
    @Query('page') page: string = '1',
    @Query('perPage') perPage: string = '10',
    @Query('search') search?: string,
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
      search,
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

  @Get('export/excel')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('superadmin', 'admin')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async exportBookingsToExcel(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const buffer = await this.bookingExportsService.exportBookingsToExcel(
      startDate,
      endDate,
    );
    res.setHeader('Content-Disposition', 'attachment; filename=bookings.xlsx');
    res.send(buffer);
  }

  @Get('/export/csv')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('superadmin', 'admin')
  @Header('Content-Type', 'text/csv')
  async exportBookingsToCsv(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filePath = await this.bookingExportsService.exportBookingsToCsv(
      startDate,
      endDate,
    );
    res.download(filePath);
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

  @Post(':id')
  @SetMetadata('message', 'Booking success crated!')
  async createBookingbyId(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: CreateBookingDto,
  ): Promise<ApiResponse<BookingEntity | RecommendationEntity[]>> {
    return this.bookingService.createBooking(id, data);
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
