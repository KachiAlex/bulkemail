import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';

let app: any;

const bootstrap = async () => {
  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  
  const nestApp = await NestFactory.create(AppModule, adapter, {
    logger: ['error', 'warn'],
  });
  
  nestApp.enableCors({
    origin: true,
    credentials: true,
  });
  
  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  nestApp.init();
  return nestApp;
};

export default async function handler(req: any, res: any) {
  if (!app) {
    app = await bootstrap();
  }
  app.getHttpServer().emit('request', req, res);
}
