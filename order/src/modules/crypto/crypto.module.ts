import { Module } from '@nestjs/common';
import { OrderRepository } from './models/repositories/order.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './services/order.service';
import { RedisService } from './services/redis.service';
import { PriceGateWayService } from './services/price-gateway.service';
import { OrderController } from './controllers/order.controller';
import { ClientProxyFactory, ClientsModule, RmqOptions, Transport } from '@nestjs/microservices';
import { config as dotenvConfig } from 'dotenv';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeorm from '../../config/typeorm.config';
import { APP_FILTER } from '@nestjs/core';
import { ResponseServerException } from 'src/common/exceptions/catch.exeption';
dotenvConfig({ path: '.env' });

const repositories = [OrderRepository];
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.get('typeorm'),
      inject: [ConfigService],
    }),

    TypeOrmModule.forFeature([OrderRepository]),
  ],
  providers: [
    {
      provide: 'ORDER_SERVICES',
      useFactory: () => {
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: ['amqp://localhost:5672'],
            queue: 'order-services',
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
    ...repositories,
    OrderService,
    RedisService,
    PriceGateWayService,
  ],
  controllers: [OrderController],
})
export class CryptoModule {}
