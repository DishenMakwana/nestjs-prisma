import { Prisma } from '@prisma/client';

export type UserQueryType = {
  where: Prisma.UserWhereInput;
  orderBy: Prisma.UserOrderByWithRelationInput;
  select: Prisma.UserSelect;
  skip?: number;
  take?: number;
};

export type UserSortColumnType =
  | 'id'
  | 'created_at'
  | 'username'
  | 'email'
  | 'school';

export type TeamSortColumnType = 'id' | 'created_at' | 'name';
