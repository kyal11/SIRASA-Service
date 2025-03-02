import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ExceptionsFilter } from './common/filters/exception.filter';
import { Reflector } from '@nestjs/core';
import * as express from 'express';
import { join } from 'path';
import { GlobalContentTypeInterceptor } from './common/interceptors/content-type.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);

  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(
    new ResponseInterceptor(reflector),
    new GlobalContentTypeInterceptor(),
  );
  // app.useGlobalFilters(new ExceptionsFilter());
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  app.use('/public', express.static(join(__dirname, '..', 'public')));
  app.use(
    '/.well-known',
    express.static(join(__dirname, '..', 'public/.well-known')),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
