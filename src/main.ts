import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import appConfig from './config/app.config';
import { AppExceptionFilter } from './filters/app-exception.filter';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new AppExceptionFilter());
  app.enableCors({ origin: '*' });

  const config = new DocumentBuilder()
    .setTitle('Digital Referral Management Platform')
    .setDescription(
      'A web-based digital referral and transfer management system for coordination between District Hospitals (Nyamata, Masaka, Nyarugenge) and National Referral Hospitals (CHUK, RMH) in Rwanda. ' +
      'Aligned with INHSRG (2020) standards.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/v1/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
