import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const logger: Logger = new Logger('Admin Seeder');

export const adminSeed = async () => {
  try {
    const adminData: any = {
      username: process.env.ADMIN_EMAIL,
      email: process.env.ADMIN_EMAIL,
      first_name: 'Admin',
      last_name: 'Admin',
      is_verified: true,
      role: 'admin',
      permission: 'all',
      is_onboarded: true,
      password: await bcrypt.hash(
        process.env.ADMIN_PASSWORD,
        +process.env.SALT_ROUNDS
      ),
    };

    await prisma.user.upsert({
      where: { id: 1 },
      update: adminData,
      create: adminData,
    });

    logger.debug('Admin seeded successfully');
  } catch (error: any) {
    logger.debug('Error Seeding Admin : ', error);
  }
};
