import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AuthUserType, OrderType } from '../common/types';
import {
  FileUploadDto,
  ListQueryInput,
  UpdateProfileDto,
  UserPhotoDto,
} from './dto';
import { AwsService } from '../aws/aws.service';
import { PrismaService } from '../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { message, taskEvent } from '../common/assets';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserTransformer } from './user.transformer';
import { PusherService } from '../pusher/pusher.service';
import { Prisma, Role } from '@prisma/client';
import { UserQueryType, UserSortColumnType } from '../admin/types';

@Injectable()
export class UserService {
  private readonly logger: Logger = new Logger(UserService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly awsService: AwsService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly userTransformer: UserTransformer,
    private readonly pusherService: PusherService
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

  async userListing(listQueryInput: ListQueryInput) {
    const search: string = listQueryInput.search ?? null;
    const limit: number = listQueryInput.limit ?? 10;
    const page: number = listQueryInput.page ?? 0;
    const sort: UserSortColumnType =
      (listQueryInput.sort as UserSortColumnType) ?? 'created_at';
    const order: OrderType = (listQueryInput.order as OrderType) ?? 'desc';

    const allowedSortColumns = [
      'id',
      'created_at',
      'username',
      'email',
      'school',
    ];

    const allowedSortOrders = ['asc', 'desc'];

    if (!allowedSortColumns.includes(sort)) {
      throw new BadRequestException(message.common.INVALID_SORT_COLUMN);
    }

    if (!allowedSortOrders.includes(order)) {
      throw new BadRequestException(message.common.INVALID_SORT_ORDER);
    }

    let where: Prisma.UserWhereInput = {
      role: Role.user,
      is_onboarded: true,
    };

    const orderBy: Prisma.UserOrderByWithRelationInput = {};

    orderBy[sort] = order;

    if (search) {
      where = {
        ...where,
        OR: [
          {
            username: {
              contains: search,
            },
          },
          {
            email: {
              startsWith: search,
            },
          },
        ],
      };
    }

    let query: UserQueryType = {
      where,
      orderBy,
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        role: true,
        username: true,
        is_verified: true,
        is_onboarded: true,
      },
    };

    if (limit) {
      const offset = limit * page;
      query = {
        skip: offset,
        take: limit,
        ...query,
      };
    }

    const [total, userList] = await Promise.all([
      this.prisma.user.count({
        where,
      }),
      this.prisma.user.findMany(query),
    ]);

    return {
      total,
      userList,
    };
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

  decryptData(encryptedData: any): string {
    const buffer = Buffer.from(encryptedData, 'base64');
    return buffer.toString('utf-8');
  }
}
