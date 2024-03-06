import { Resolver, Args, Mutation, Context } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { UpdateUserInput } from './dto/update-user.input';
import { ChangeUserPasswordResponse } from './dto/change-user-password.response';
import { ChangeUserPasswordInput } from './dto/change-user-password.input';
import { UserResponse } from './dto/user.response';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Mutation(() => UserResponse)
  @UseGuards(JwtAuthGuard)
  async updateUserProfile(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @Context() ctx: any,
  ): Promise<UserResponse> {
    const userId = ctx.req.user.id;
    return await this.usersService.updateUserInfo(userId, updateUserInput);
  }

  @Mutation(() => ChangeUserPasswordResponse)
  @UseGuards(JwtAuthGuard)
  async changeUserPassword(
    @Args('changeUserPasswordInput')
    changeUserPasswordInput: ChangeUserPasswordInput,
    @Context() ctx: any,
  ): Promise<ChangeUserPasswordResponse> {
    const userId = ctx.req.user.id;
    await this.usersService.changeUserPassword(userId, changeUserPasswordInput);

    return { success: true };
  }
}
