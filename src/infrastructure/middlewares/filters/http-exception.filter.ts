import {
  ArgumentsHost, ExceptionFilter, Catch, Logger, HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { IErrorResponse } from './error-response.interface';

/**
 * Middleware for exception handling.
 *
 * Handles NestJS exceptions and retrieve maximum information,
 * then map it for response.
 *
 * @see {@link https://docs.nestjs.com/exception-filters Exception handling in NestJS}
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const error = exception.getResponse() as IErrorResponse;

    const context = {
      timestamp: new Date().toISOString(),
      path: request.url,
      status,
    };

    const errorResponse = {
      status,
      data: null,
      error: error.message,
    };

    this.logger.error(error.message, exception.stack, JSON.stringify(context));
    response.status(status).json(errorResponse);
  }
}
