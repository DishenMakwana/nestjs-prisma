import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { message } from '../common/assets';
import { CreateConfigDto, UpdateConfigDto } from './dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CustomConfigService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  async create(body: CreateConfigDto) {
    const isExist = await this.prisma.config.findFirst({
      where: {
        key: body.key,
      },
    });

    if (isExist) {
      throw new ForbiddenException(message.config.CONFIG_ALREADY_EXISTS);
    }

    await this.prisma.config.create({
      data: {
        key: body.key,
        value: body.value,
      },
    });
  }

  async findAll() {
    return this.prisma.config.findMany({
      select: {
        id: true,
        key: true,
        value: true,
        slug: true,
      },
    });
  }

  async allConfig() {
    const config = await this.prisma.config.findMany({
      select: {
        id: true,
        key: true,
        value: true,
      },
    });

    const configObj = {};

    config.forEach((item) => {
      configObj[item.key] = item.value;
    });

    configObj['minimumVersion'] =
      this.configService.getOrThrow<string>('APP_MIN_VERSION');

    configObj['eventLockInTime'] =
      this.configService.getOrThrow<string>('EVENT_LOCKIN_TIME');

    return configObj;
  }

  async findOne(id: number) {
    return this.prisma.config.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        key: true,
        value: true,
      },
    });
  }

  async update(id: number, body: UpdateConfigDto) {
    await this.prisma.config.update({
      where: {
        id,
      },
      data: {
        key: body.key,
        value: body.value,
      },
    });
  }

  async remove(id: number) {
    await this.prisma.config.deleteMany({
      where: {
        id,
      },
    });
  }

  async search(key: string) {
    return this.prisma.config.findFirst({
      where: {
        key,
      },
      select: {
        id: true,
        value: true,
      },
    });
  }
}
