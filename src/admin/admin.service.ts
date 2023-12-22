import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma, Role } from '@prisma/client';
import { AdminTransformer } from './admin.transformer';
import { CustomResponse, message } from '../common/assets';
import { Buffer } from 'buffer';
import { OrderType, PayloadType } from '../common/types';
import { UserQueryType, UserSortColumnType } from './types';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminTransformer: AdminTransformer
  ) {}

  async userList(payload: PayloadType) {
    const search: string = payload.search ?? null;
    const limit: number = payload.limit ?? 10;
    const page: number = payload.page ?? 0;
    const sort: UserSortColumnType =
      (payload.sort as UserSortColumnType) ?? 'created_at';
    const order: OrderType = (payload.order as OrderType) ?? 'desc';

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
        username: true,
        email: true,
        is_verified: true,
        is_social_register: true,
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

  async userDetail(id: number) {
    const userDetail = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        username: true,
        email: true,
        is_verified: true,
        is_social_register: true,
        is_onboarded: true,
        provider: true,
        first_name: true,
        last_name: true,
        logo: true,
      },
    });

    if (!userDetail) throw new NotFoundException(message.user.USER_NOT_FOUND);

    return CustomResponse(
      this.adminTransformer.transformUserDetail(userDetail),
      message.admin.USER_DETAILS
    );
  }

  private generateName() {
    const string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let randomString = '';

    for (let i = 0; i < 10; i++) {
      randomString += string.charAt(Math.floor(Math.random() * string.length));
    }

    return randomString;
  }

  private getRandomTeamSize(): number {
    const randomNumber = Math.floor(Math.random() * 4) + 1;
    return randomNumber;
  }

  private encryptData(data: any): string {
    const buffer = Buffer.from(JSON.stringify(data));
    return buffer.toString('base64');
  }
}
