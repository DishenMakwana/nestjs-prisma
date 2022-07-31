import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const userSeed = async () => {
  try {
    const data: any = {
      firstName: 'Administrator',
      lastName: '',
      name: 'Administrator',
      email: 'admin@gmail.com',
      password: await bcrypt.hash('admin', 10),
      role: 'admin',
      status: true,
    };
    await prisma.user.upsert({
      where: { id: 1 },
      update: data,
      create: data,
    });

    console.log('User table seeded successfully');
  } catch (error: any) {
    console.log('Error Seeding User : ', error.message);
  }
};

userSeed();
