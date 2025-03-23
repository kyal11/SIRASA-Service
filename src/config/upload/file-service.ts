import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileService {
  private readonly uploadFolder = path.join('/', 'uploads', 'profiles');

  constructor() {
    if (!fs.existsSync(this.uploadFolder)) {
      fs.mkdirSync(this.uploadFolder, { recursive: true });
    }
  }

  async uploadFileImage(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      throw new HttpException(
        `Unsupported file extension ${fileExtension}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(this.uploadFolder, fileName);

    fs.writeFileSync(filePath, file.buffer);

    return `/uploads/profiles/${fileName}`;
  }

  async deleteProfileImage(filePath: string): Promise<void> {
    const absolutePath = path.join('/', filePath); // Pastikan path absolut juga benar!

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    } else {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }
  }
}
