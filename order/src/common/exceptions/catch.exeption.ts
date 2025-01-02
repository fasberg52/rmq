import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class ResponseServerException implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctxType = host.getType();

    if (ctxType === 'http') {
      this.handleHttpException(exception, host);
    } else if (ctxType === 'rpc') {
      this.handleRpcException(exception, host);
    } else {
      console.error(`[Unhandled Exception Type]: ${ctxType}`);
    }
  }

  private handleHttpException(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    console.error(
      `[HTTP] [${new Date().toISOString()}] ${status} - ${message}`,
    );
    console.error(exception);

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private handleRpcException(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToRpc();
    const data = ctx.getData();

    let status: number;
    let message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse() as string;
    } else if (exception instanceof RpcException) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.getError() as string;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
    }

    console.error(`[RPC] [${new Date().toISOString()}] ${status} - ${message}`);
    console.error(exception);

    throw new RpcException({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      data,
    });
  }
}
