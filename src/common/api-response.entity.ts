import { Expose } from 'class-transformer';

export class ApiResponse<T> {
  @Expose()
  status: 'success' | 'error';

  @Expose()
  message: string;

  @Expose()
  data?: T;

  constructor(status: 'success' | 'error', message: string, data?: T) {
    this.status = status;
    this.message = message;
    this.data = data;
  }
}
