import 'dotenv/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaService } from './database/prisma.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as basicAuth from 'express-basic-auth';

async function bootstrap() {
  const logger: Logger = new Logger('App');

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'debug', 'verbose'],
  });

  app.useStaticAssets(join(__dirname, '..', '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', '..', 'public', 'pages'));
  app.setViewEngine('hbs');

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const databaseService: PrismaService = app.get(PrismaService);
  databaseService.enableShutdownHooks(app);

  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('NestJS template which provide basic auth flow.”')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const docsPath = ['/api/docs'];
  app.use(
    docsPath,
    basicAuth({
      challenge: true,
      users: { admin: 'Admin@123' },
    }),
  );

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(docsPath[0], app, document);

  app.enableCors();

  await app.listen(process.env.PORT || 5000);

  logger.debug(`Server is running on port ${process.env.PORT || 5000}`);
}

bootstrap();
