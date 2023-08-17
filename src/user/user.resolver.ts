import { Args, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { ListQueryInput, UserListingResponse } from './dto';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  // @Auth({
  //   roles: [Role.admin, Role.user],
  // })
  @Query(() => UserListingResponse)
  async userListing(@Args('listQueryInput') listQueryInput: ListQueryInput) {
    return this.userService.userListing(listQueryInput);
  }
}
