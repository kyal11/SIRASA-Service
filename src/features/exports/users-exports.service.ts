import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { createObjectCsvWriter } from 'csv-writer';
import { UserEntity } from 'src/models/users/serialization/user.entity';
import { UsersService } from '../../models/users/users.service';

@Injectable()
export class UsersExportsService {
  constructor(private readonly usersService: UsersService) {}
  private formatUserData(users: UserEntity[]) {
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.verified ? 'Yes' : 'No',
      phoneNumber: user.phoneNumber || '-',
      imageUrl: user.imageUrl ? `${process.env.BASE_URL}${user.imageUrl}` : '-',
      createdAt: user.createdAt,
    }));
  }

  async exportUsersToExcel(
    startDate?: string,
    endDate?: string,
  ): Promise<Buffer> {
    const users: UserEntity[] = await this.usersService.getAllUsers(
      startDate,
      endDate,
    );
    const formattedUsers = this.formatUserData(users);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 25 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Role', key: 'role', width: 15 },
      { header: 'Verified', key: 'verified', width: 10 },
      { header: 'Phone Number', key: 'phoneNumber', width: 15 },
      { header: 'Image URL', key: 'imageUrl', width: 30 },
      { header: 'Created At', key: 'createdAt', width: 20 },
    ];

    formattedUsers.forEach((user) => {
      worksheet.addRow(user);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as Buffer;
  }

  async exportUsersToCsv(
    startDate?: string,
    endDate?: string,
  ): Promise<string> {
    const users: UserEntity[] = await this.usersService.getAllUsers(
      startDate,
      endDate,
    );
    const formattedUsers = this.formatUserData(users);
    const csvWriter = createObjectCsvWriter({
      path: 'users.csv',
      header: [
        { id: 'id', title: 'ID' },
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'role', title: 'Role' },
        { id: 'verified', title: 'Verified' },
        { id: 'phoneNumber', title: 'Phone Number' },
        { id: 'imageUrl', title: 'Image URL' },
        { id: 'createdAt', title: 'Created At' },
      ],
    });

    await csvWriter.writeRecords(formattedUsers);
    return 'users.csv';
  }
}
