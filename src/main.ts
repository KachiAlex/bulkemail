import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS — supports comma-separated list of allowed origins
  const rawCorsOrigin = configService.get<string>('CORS_ORIGIN') || 'http://localhost:5173';
  const allowedOrigins = rawCorsOrigin.split(',').map((o) => o.trim()).filter(Boolean);
  console.log('CORS debug: allowedOrigins =', allowedOrigins);
  app.enableCors({
    origin: (origin, callback) => {
      console.log('CORS debug: incoming origin =', origin);
      // Allow server-to-server requests (no origin header)
      if (!origin) return callback(null, true);
      const isVercelPreview = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);
      if (allowedOrigins.includes(origin) || isVercelPreview) {
        console.log('CORS debug: origin allowed:', origin);
        return callback(null, true);
      }
      console.log('CORS debug: origin NOT allowed:', origin);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix(configService.get('API_PREFIX') || 'api');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('AI-Powered CRM API')
    .setDescription('API documentation for AI-powered CRM platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('contacts', 'Contact management')
    .addTag('campaigns', 'Campaign management')
    .addTag('telephony', 'Telephony and call management')
    .addTag('ai', 'AI-powered features')
    .addTag('analytics', 'Analytics and reporting')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();

