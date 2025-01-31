import { Role } from '@prisma/client';
import {
  IsString,
  IsEmail,
  MinLength,
  IsBoolean,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  password?: string;

  @IsString()
  @IsOptional()
  nim?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsBoolean()
  @IsOptional()
  verified?: boolean;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
