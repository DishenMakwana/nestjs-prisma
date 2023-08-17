import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class ListQueryInput {
  @Field({
    defaultValue: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  limit?: number;

  @Field({
    defaultValue: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @Field({
    nullable: true,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @Field({
    nullable: true,
  })
  @IsOptional()
  @IsString()
  sort?: string;

  @Field({
    nullable: true,
  })
  @IsOptional()
  @IsString()
  order?: string;
}

@ObjectType()
export class UserList {
  @Field()
  id: number;

  @Field()
  first_name: string;

  @Field()
  last_name: string;

  @Field()
  email: string;

  @Field()
  role: string;

  @Field()
  username: string;

  @Field()
  is_verified: boolean;

  @Field()
  is_onboarded: boolean;
}

@ObjectType()
export class UserListingResponse {
  @Field()
  total: number;

  @Field(() => [UserList])
  userList: UserList[];
}
