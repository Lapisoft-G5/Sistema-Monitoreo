import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter.js';

import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
      credentials: true,
    },
  });

  app.use(helmet());
  app.use(cookieParser());
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Backend running on ${await app.getUrl()}/api`);
}

void bootstrap();
