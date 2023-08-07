import 'dotenv/config';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule, modules } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { urlencoded } from 'express';
import * as basicAuth from 'express-basic-auth';
import * as morgan from 'morgan';
import { PrismaService } from './database/prisma.service';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as requestIp from 'request-ip';

async function bootstrap() {
  const logger: Logger = new Logger(process.env.APP_NAME);

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger:
      process.env.NEST_LOG === 'true'
        ? ['error', 'warn', 'debug', 'verbose', 'log']
        : ['error', 'warn', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  if (configService.getOrThrow<string>('API_ROUTE_LOG') === 'true') {
    app.use(morgan('dev'));
  }

  app.setGlobalPrefix('api');

  // Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  app.useStaticAssets(join(__dirname, '..', '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', '..', 'public', 'pages'));

  app.setViewEngine('hbs');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      // forbidNonWhitelisted: true,
    })
  );

  const databaseService: PrismaService = app.get(PrismaService);
  await databaseService.enableShutdownHooks(app);

  let config: any = new DocumentBuilder()
    .setTitle(configService.getOrThrow<string>('APP_NAME'))
    .setDescription(
      'Application dedicated to college/universities to organize events'
    )
    .setExternalDoc('Postman Collection', '/api/docs-json')
    .setVersion('1.0')
    .addBearerAuth();

  for (const key in modules) {
    const module = modules[key];

    config = config.addTag(key, module.name, {
      description: module.name,
      url: `/api/${key}`,
    });

    const options = new DocumentBuilder()
      .setTitle(`${module.name}`)
      .setDescription(`The ${module.name} API description`)
      .setVersion('1.0')
      .setExternalDoc('Postman Collection', `/api/${key}-json`)
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, options, {
      include: [module],
    });

    SwaggerModule.setup(`api/${key}`, app, document);
  }

  config = config.build();

  const docsPath = '/api/docs';

  if (configService.getOrThrow<string>('PROTECT_SWAGGER') === 'true') {
    const user = {};
    user[configService.getOrThrow<string>('SWAGGER_USER')] =
      configService.getOrThrow<string>('SWAGGER_PASSWORD');

    app.use(
      docsPath,
      basicAuth({
        challenge: true,
        users: user,
      })
    );
  }

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(docsPath, app, document);

  app.useBodyParser('json', { limit: '50mb' });
  app.use(urlencoded({ limit: '50mb', extended: true }));

  app.use(helmet());
  app.use(requestIp.mw());

  const enableCors = configService.getOrThrow<boolean>('ENABLE_CORS');
  if (enableCors) {
    app.enableCors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      // maxAge: 3600, // Specify the maximum cache duration in seconds
      credentials: true,
    });
  }

  await app.listen(configService.getOrThrow<number>('PORT') || 5000, '0.0.0.0');

  logger.debug(`Application is running on: ${await app.getUrl()}`);
  logger.debug(
    `Swagger docs: ${configService.getOrThrow<string>(
      'API_BASE_URL'
    )}${docsPath}`
  );
}
bootstrap();
