import { Expose } from 'class-transformer';

export class ApiResponse<T> {
  @Expose()
  status: 'success' | 'error' | 'recommendation';

  @Expose()
  message: string;

  @Expose()
  data?: T;

  constructor(
    status: 'success' | 'error' | 'recommendation',
    message: string,
    data?: T,
  ) {
    this.status = status;
    this.message = message;
    this.data = data;
  }
}
