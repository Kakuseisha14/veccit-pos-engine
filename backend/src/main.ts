import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import type { Express } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const corsOrigin =
    configService.get<string>('corsOrigin') ?? 'http://localhost:3000';

  app.setGlobalPrefix('api');
  app.use(helmet());
  app.use(cookieParser());
  const httpServer = app.getHttpAdapter().getInstance() as Express;
  httpServer.set(
    'trust proxy',
    configService.get<string>('NODE_ENV') === 'production' ? 1 : false,
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origen (ej: curl, insomnia) o cualquier localhost/127.0.0.1 en dev
      if (
        !origin ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(null, corsOrigin);
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, Cookie',
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Veccit POS Engine API')
    .setDescription(
      'API del sistema Punto de Venta y gestión de inventario multi-tenant',
    )
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
