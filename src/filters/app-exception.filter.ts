import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import ServerResponse from 'src/utils/ServerResponse';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resPayload = exception.getResponse();
      message = typeof resPayload === 'object' ? resPayload['message'] || exception.message : resPayload;
      details = resPayload;
    } else {
      // Handle non-HTTP exceptions (like Prisma, Typecasting errors, etc.)
      this.logger.error('Unhandled Exception Caught:', (exception as Error).stack);
      message = (exception as Error).message || 'An unexpected error occurred';
    }

    // Comprehensive response formatting
    if (status === 400) {
       const msg = Array.isArray(message) ? message[0] : message;
       return response.status(status).json(ServerResponse.error(msg, details));
    }

    if (status === 403) {
      return response.status(status).json(ServerResponse.error('Access Forbidden', details || 'You do not have permission for this action'));
    }

    if (status === 500) {
      this.logger.error(`500 Error: ${message}`, details);
    }

    response.status(status).json(
      ServerResponse.error(
        Array.isArray(message) ? message[0] : message,
        details,
      ),
    );
  }
}
