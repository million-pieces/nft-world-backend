import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Middleware which map all responses to the same type
 */
@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const response = http.getResponse();

    const { route } = http.getRequest<Request>();

    if (route.path === '/world-in-pieces/:id') {
      return next.handle();
    }

    if (route.path === '/citizen-nft/:id') {
      return next.handle();
    }

    return next.handle().pipe(
      map((responseData) => {
        const mappedResponse = {
          status: response.statusCode,
          data: responseData,
          error: '',
        };
        return mappedResponse;
      }),
    );
  }
}
