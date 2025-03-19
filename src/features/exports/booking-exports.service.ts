import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { createObjectCsvWriter } from 'csv-writer';
import { BookingService } from 'src/models/booking/booking.service';
import { BookingEntity } from 'src/models/booking/serilization/booking.entity';

@Injectable()
export class BookingExportsService {
  constructor(private readonly bookingService: BookingService) {}

  private formatBookingData(bookings: BookingEntity[]) {
    return bookings.map((booking) => {
      const sortedSlots = booking.slots
        .filter((slot) => slot.startTime && slot.endTime)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

      const firstSlot = sortedSlots[0];
      console.log(firstSlot);
      console.log(firstSlot.createdAt);
      const timeRange = sortedSlots
        .map((slot) => `${slot.startTime} - ${slot.endTime}`)
        .join(', ');

      return {
        userName: booking.userName || '-',
        userNim: booking.userNim || '-',
        phoneNumber: booking.phoneNumber || '-',
        roomName: booking.roomName || '-',
        participant: booking.participant || 0,
        borrowDate: firstSlot?.createdAt
          ? new Date(firstSlot.createdAt).toLocaleDateString('id-ID')
          : '-',
        borrowTime: timeRange || '-',
        status: booking.status || '-',
        createdAt: booking.createdAt
          ? new Date(booking.createdAt).toLocaleDateString('id-ID')
          : '-',
      };
    });
  }

  async exportBookingsToExcel(
    startDate?: string,
    endDate?: string,
  ): Promise<Buffer> {
    const bookings: BookingEntity[] = await this.bookingService.getAllBooking(
      startDate,
      endDate,
    );
    const formattedBookings = this.formatBookingData(bookings);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bookings');

    worksheet.columns = [
      { header: 'Nama', key: 'userName', width: 20 },
      { header: 'NIM', key: 'userNim', width: 15 },
      { header: 'No Telepon', key: 'phoneNumber', width: 15 },
      { header: 'Nama Ruangan', key: 'roomName', width: 25 },
      { header: 'Jumlah Peserta', key: 'participant', width: 20 },
      { header: 'Tanggal Peminjaman', key: 'borrowDate', width: 20 },
      { header: 'Waktu Peminjaman', key: 'borrowTime', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Dibuat Pada', key: 'createdAt', width: 20 },
    ];

    formattedBookings.forEach((booking) => {
      worksheet.addRow(booking);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as Buffer;
  }

  async exportBookingsToCsv(
    startDate?: string,
    endDate?: string,
  ): Promise<string> {
    const bookings: BookingEntity[] = await this.bookingService.getAllBooking(
      startDate,
      endDate,
    );
    const formattedBookings = this.formatBookingData(bookings);
    const csvWriter = createObjectCsvWriter({
      path: 'bookings.csv',
      header: [
        { id: 'userName', title: 'Nama' },
        { id: 'userNim', title: 'NIM' },
        { id: 'phoneNumber', title: 'No Telepon' },
        { id: 'roomName', title: 'Nama Ruangan' },
        { id: 'participant', title: 'Jumlah Peserta' },
        { id: 'borrowDate', title: 'Tanggal Peminjaman' },
        { id: 'borrowTime', title: 'Waktu Peminjaman' },
        { id: 'status', title: 'Status' },
        { id: 'createdAt', title: 'Dibuat Pada' },
      ],
    });

    await csvWriter.writeRecords(formattedBookings);
    return 'bookings.csv';
  }
}
