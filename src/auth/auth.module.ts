import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { ATStrategy } from './strategies';
import { AuthTransformer } from './auth.transformer';
import { AuthEvent } from './event';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppleApiService, GoogleApiService } from './services';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<string>(
            'ACCESS_TOKEN_EXPIRES_IN'
          ),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    ATStrategy,
    AuthTransformer,
    AuthEvent,
    GoogleApiService,
    AppleApiService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
