import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        // Allow controllers to pass a custom message via data.message
        const message =
          data && typeof data === 'object' && 'message' in data
            ? (data as { message: string }).message
            : 'Request successful';

        const payload =
          data && typeof data === 'object' && 'data' in data
            ? (data as { data: T }).data
            : data;

        return {
          success: true,
          statusCode: response.statusCode,
          message,
          data: payload,
        };
      }),
    );
  }
}
