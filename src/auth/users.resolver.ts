import { Resolver, Args, Mutation, Context } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { UpdateUserInput } from './dto/update-user.input';
import { ChangeUserPasswordResponse } from './dto/change-user-password.response';
import { ChangeUserPasswordInput } from './dto/change-user-password.input';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard)
  async updateUserProfile(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @Context() ctx: any,
  ) {
    const userId = ctx.req.user.id;
    return this.usersService.updateUserInfo(userId, updateUserInput);
  }

  @Mutation(() => ChangeUserPasswordResponse)
  @UseGuards(JwtAuthGuard)
  async changeUserPassword(
    @Args('changeUserPasswordInput')
    changeUserPasswordInput: ChangeUserPasswordInput,
    @Context() ctx: any,
  ) {
    const userId = ctx.req.user.id;
    await this.usersService.changeUserPassword(userId, changeUserPasswordInput);

    return { success: true };
  }
}
