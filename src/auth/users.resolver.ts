import { Resolver, Query, Args } from '@nestjs/graphql';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => User, { nullable: true })
  async user(@Args('email') email: string): Promise<User> {
    return this.usersService.getUser(email);
  }
}
