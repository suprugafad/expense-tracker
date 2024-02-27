import { Resolver, Query, Args, Mutation, Context } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { UpdateUserInput } from './dto/update-user.input';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => User, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async user(@Args('email') email: string): Promise<User> {
    return this.usersService.getUserByEmail(email);
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard)
  async updateUserProfile(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @Context() ctx: any,
  ) {
    const userId = ctx.req.user.id;
    return this.usersService.updateUserInfo(userId, updateUserInput);
  }
}
