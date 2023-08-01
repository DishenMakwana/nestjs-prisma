import {
  INestApplication,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaSoftDeleteMiddleware } from '../common/middleware';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query'>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger: Logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.getOrThrow<string>('DATABASE_URL'),
        },
      },
      log:
        configService.getOrThrow<string>('PRISMA_LOG') === 'true'
          ? [
              {
                emit: 'event',
                level: 'query',
              },
              'error',
              'info',
              'warn',
            ]
          : undefined,
    });

    this.$on<any>('query', (e: Prisma.QueryEvent) => {
      this.logger.debug(
        `Query: ${e.query}` + ` ${e.params}` + ` duration: ${e.duration} ms`
      );
    });
  }

  async onModuleInit() {
    await this.$connect();

    PrismaSoftDeleteMiddleware(this);
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on<'beforeExit'>('beforeExit', async () => {
      try {
        await app.close();
      } catch (error) {
        this.logger.error({ error });
      }
    });
  }
}
