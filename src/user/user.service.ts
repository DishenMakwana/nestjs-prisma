import { Inject, Injectable, Logger } from '@nestjs/common';
import { AuthUserType } from '../common/types';
import { FileUploadDto, UpdateProfileDto, UserPhotoDto } from './dto';
import { AwsService } from '../aws/aws.service';
import { PrismaService } from '../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { taskEvent } from '../common/assets';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserTransformer } from './user.transformer';
import { PusherService } from '../pusher/pusher.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class UserService {
  private readonly logger: Logger = new Logger(UserService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly awsService: AwsService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly userTransformer: UserTransformer,
    private readonly pusherService: PusherService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async profileData(authUser: AuthUserType) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: authUser.id,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        created_at: true,
        email: true,
        username: true,
        logo: true,
      },
    });

    return this.userTransformer.transformUser(user);
  }

  async profilePhotoUpdate(authUser: AuthUserType, files: UserPhotoDto) {
    let photo = null;

    if (files?.photo.length > 0) {
      photo = await this.awsService.uploadFile(
        'users',
        authUser.id,
        files.photo[0]
      );
    }

    if (photo !== null) {
      await this.prisma.user.update({
        where: {
          id: authUser.id,
        },
        data: {
          logo: `${photo?.fileName}`,
        },
      });

      return this.userTransformer.transformUserProfile(photo?.fileName);
    }
  }

  async profileUpdate(authUser: AuthUserType, body: UpdateProfileDto) {
    await this.prisma.user.update({
      where: {
        id: authUser.id,
      },
      data: {
        first_name: body.firstName,
        last_name: body.lastName,
      },
    });
  }

  async testPusher(channel: string, event: string) {
    await this.pusherService.send(
      channel,
      event,
      { key1: 'value1', key2: 'value2' },
      'Hello World'
    );
  }

  async testEmail(email: string) {
    return this.eventEmitter.emit(taskEvent.TEST_EMAIL, email);
  }

  async testNotification(userId: string) {
    return this.eventEmitter.emit(taskEvent.TEST_NOTIFICATION, userId);
  }

  async testAWSUploadFile(userId: string, path: string, files: FileUploadDto) {
    return this.awsService.uploadFile(path, +userId, files.file[0]);
  }

  async testCache() {
    const cacheData = {
      name: 'test',
      email: 'test@gmail.com',
    };

    console.log(
      'Before cache:',
      await this.cacheManager.get('key'),
      new Date()
    );

    await this.cacheManager.set('key', JSON.stringify(cacheData));
    const data: string = await this.cacheManager.get('key');

    console.log('After cache:', JSON.parse(data), new Date());

    const res = await this.cacheManager.del('key');

    console.log(
      'After delete:',
      await this.cacheManager.get('key'),
      res,
      JSON.parse(data),
      new Date()
    );

    return { res, data: JSON.parse(data) };
  }

  decryptData(encryptedData: any): string {
    const buffer = Buffer.from(encryptedData, 'base64');
    return buffer.toString('utf-8');
  }
}
