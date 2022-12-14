import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './database/prisma.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { UserModule } from './user/user.module';
import { HelperModule } from './helper/helper.module';
import { MailModule } from './mail/mail.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AWSModule } from './aws/aws.module';
import { NotificationModule } from './notification/notification.module';
import { FileModule } from './file/file.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    UserModule,
    HelperModule,
    MailModule,
    AWSModule,
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', '..', 'public'),
    // }),
    NotificationModule,
    FileModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: [
        './.env',
        './.env.dev',
        './.env.prod',
        './.env.stag',
        './.env.test',
      ],
    }),
  ],
  providers: [
    {
      provide: 'APP_INTERCEPTOR',
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
