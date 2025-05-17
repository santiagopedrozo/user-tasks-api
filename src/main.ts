import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { corsFactory } from './shared/config/module-factories/cors.factory';
import { AllExceptionsHttpFilter } from './shared/exception-filters/all-exceptions-http.filter';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.useGlobalFilters(new AllExceptionsHttpFilter());
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;
  const enableSwagger = configService.get<boolean>('ENABLE_SWAGGER') ?? true;

  app.enableCors(corsFactory(configService));

  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('Tasks APP')
      .setDescription('Tasks API')
      .setVersion('1.0')
      .addTag('Tasks')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(port);
}
bootstrap();
