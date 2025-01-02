import { NestFactory } from '@nestjs/core';
import { Transport, RmqOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerHelper } from './common/utils/swagger.utils';
import { config as dotenvConfig } from 'dotenv';
import { CryptoModule } from './modules/crypto/crypto.module';
dotenvConfig({ path: '.env' });

async function bootstrap() {
  const app = await NestFactory.createMicroservice(CryptoModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'order-service',
      queueOptions: {
        durable: false,
      },
    },
  } as RmqOptions);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen();
  console.log('crypto service: >> localhost:3001');
}

bootstrap();
