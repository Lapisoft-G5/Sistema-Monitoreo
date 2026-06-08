import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { Logger } from 'nestjs-pino';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter.js';

import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
      credentials: true,
    },
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));

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

  const config = new DocumentBuilder()
    .setTitle('Sistema de Monitoreo API')
    .setDescription('API documentada para el Sistema de Monitoreo UGEL')
    .setVersion('1.0')
    .addCookieAuth('refreshToken')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  const logger = app.get(Logger);
  logger.log(`Backend running on ${await app.getUrl()}/api`);
}

void bootstrap();
