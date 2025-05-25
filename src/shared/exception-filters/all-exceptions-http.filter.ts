import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainExceptionMapper } from '../mappers/domain-exception.mapper';

@Catch()
export class AllExceptionsHttpFilter implements ExceptionFilter {
  private logger = new Logger(AllExceptionsHttpFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const mapped = DomainExceptionMapper.toHttp(exception);
    if (mapped) {
      return response.status(mapped.status).json({
        statusCode: mapped.status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: (exception as Error).message.replace(/^.*?:\s*/, ''),
        error: mapped.error,
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      return response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: typeof res === 'string' ? res : (res as any).message,
        error: (res as any)?.error || exception.name,
      });
    }

    if (exception instanceof Error) {
      this.logger.error(exception, '🔥 Unhandled exception');
    } else {
      this.logger.error(
        { error: exception },
        '🔥 Unhandled non-error exception',
      );
    }

    return response.status(500).json({
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Internal server error',
    });
  }
}
