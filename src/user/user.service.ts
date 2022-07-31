import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UserTransformer } from './user.transformer';
import * as bcrypt from 'bcrypt';
import { AuthUserType } from 'src/common/types';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userTransformer: UserTransformer,
  ) {}

  async changePassword(authUser: AuthUserType, password: string) {
    const user = await this.prisma.user.update({
      where: { id: authUser.id },
      data: {
        password: await bcrypt.hash(password, 10),
      },
    });

    return this.userTransformer.transform(user);
  }
}
