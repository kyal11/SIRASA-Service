import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const message =
      this.reflector.get<string>('message', context.getHandler()) ||
      'Request successful';

    return next.handle().pipe(
      map((data) => {
        const response: any = {
          status: 'success',
          message: message,
        };
        if (data !== null && data !== undefined) {
          response.data = data; // Hanya tambahkan 'data' jika nilainya ada
        }
        return response;
      }),
    );
  }
}
