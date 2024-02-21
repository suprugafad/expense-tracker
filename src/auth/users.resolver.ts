import { Resolver, Query, Args } from '@nestjs/graphql';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => User, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async user(@Args('email') email: string): Promise<User> {
    return this.usersService.getUserByEmail(email);
  }
}
