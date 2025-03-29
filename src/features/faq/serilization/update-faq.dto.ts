import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateFaqDto {
  @IsOptional()
  @IsString({ message: 'Question must be a string' })
  @MinLength(5, { message: 'Question must be at least 5 characters long' })
  question?: string;

  @IsOptional()
  @IsString({ message: 'Answer must be a string' })
  @MinLength(5, { message: 'Answer must be at least 5 characters long' })
  answer?: string;
}
