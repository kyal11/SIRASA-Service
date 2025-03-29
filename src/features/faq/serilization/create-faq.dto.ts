import { IsString, MinLength } from 'class-validator';

export class CreateFaqDto {
  @IsString({ message: 'Question must be a string' })
  @MinLength(5, { message: 'Question must be at least 5 characters long' })
  question: string;

  @IsString({ message: 'Answer must be a string' })
  @MinLength(5, { message: 'Answer must be at least 5 characters long' })
  answer: string;
}
