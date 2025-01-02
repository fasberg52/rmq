import { NestFactory } from '@nestjs/core';
import { GateWayModule } from './gateway.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerHelper } from './common/swagger.utils';
import { ValidationPipe } from '@nestjs/common';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

async function bootstrap() {
  const app = await NestFactory.create(GateWayModule);

  new SwaggerHelper().setup(app);
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000, () => {
    console.log('gateway: http://localhost:3000');
  });
}
bootstrap();
