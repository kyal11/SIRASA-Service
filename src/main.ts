import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ExceptionsFilter } from './common/filters/exception.filter';
import { Reflector } from '@nestjs/core';
import * as express from 'express';
import { join } from 'path';
import { GlobalContentTypeInterceptor } from './common/interceptors/contentType.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(
    new ResponseInterceptor(reflector),
    new GlobalContentTypeInterceptor(),
  );
  app.useGlobalFilters(new ExceptionsFilter());
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
