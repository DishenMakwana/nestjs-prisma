import 'dotenv/config';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaService } from './database/prisma.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as basicAuth from 'express-basic-auth';
import { NODE_ENVIRONMENT } from './common/assets';
import { ConfigService } from '@nestjs/config';
import * as morgan from 'morgan';
import { json, urlencoded } from 'express';
import helmet from 'helmet';

async function bootstrap() {
  // Logger
  const logger: Logger = new Logger('NestJS App');

  // Create NestJS App
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger:
      process.env.NODE_ENV === NODE_ENVIRONMENT.DEVELOPMENT
        ? ['error', 'warn', 'debug', 'verbose', 'log']
        : ['error', 'warn', 'debug', 'verbose'],
  });

  // Get Config Service for env variables
  const configService = app.get(ConfigService);

  // log requests
  if (configService.get<string>('NODE_ENV') === NODE_ENVIRONMENT.DEVELOPMENT) {
    app.use(morgan('dev'));
  }

  // Url Prefix
  app.setGlobalPrefix('api');

  // Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    // defaultVersion: '1',
    prefix: 'v',
  });

  // setup static assets
  app.useStaticAssets(join(__dirname, '..', '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', '..', 'public', 'pages'));

  // setup template engine
  app.setViewEngine('hbs');

  // setup validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  // setup database
  const databaseService: PrismaService = app.get(PrismaService);
  databaseService.enableShutdownHooks(app);

  // setup swagger
  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('Cheetah Broker Swagger Docs.')
    .setVersion('1.0')
    // .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    // .addServer('http://localhost:5001')
    // .addServer('https://api.cheetahbroker.com')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'access_token',
    })
    .setExternalDoc('Postman Collection', '/api/docs-json')
    .build();

  const docsPath = '/api/docs';

  if (configService.get<string>('NODE_ENV') === NODE_ENVIRONMENT.PRODUCTION) {
    const user = {};
    user[configService.get<string>('SWAGGER_USER')] =
      configService.get<string>('SWAGGER_PASSWORD');

    app.use(
      docsPath,
      basicAuth({
        challenge: true,
        users: user,
      }),
    );
  }

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(docsPath, app, document);

  // setup body parser
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  // enable helmet
  app.use(helmet());

  // enable cors
  const enableCors = configService.get<boolean>('ENABLE_CORS');
  if (enableCors) {
    app.enableCors();
  }

  await app.listen(configService.get<number>('PORT') || 5000);

  logger.debug(
    `Server is running on port ${configService.get<number>('PORT') || 5000}`,
  );
}

bootstrap();
