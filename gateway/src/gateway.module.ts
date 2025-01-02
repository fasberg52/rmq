import { Module } from '@nestjs/common';
import {
  ClientProxyFactory,
  RmqOptions,
  Transport,
} from '@nestjs/microservices';
import { OrderController } from './order.controller';
import { APP_FILTER } from '@nestjs/core';
import { ResponseServerException } from './common/exceptions/catch.exception';

@Module({
  imports: [],
  controllers: [OrderController],
  providers: [
    {
      provide: 'ORDER_SERVICE',
      useFactory: () => {
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: ['amqp://localhost:5672'],
            queue: 'order-service',
            queueOptions: {
              durable: false,
            },
          },
        } as RmqOptions);
      },
      inject: [],
    },

    {
      provide: APP_FILTER,
      useClass: ResponseServerException,
    },
  ],
})
export class GateWayModule {}
