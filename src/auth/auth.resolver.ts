import { RefreshTokenResponse } from './dto/refresh-token.response';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { RegisterUserInput } from './dto/register-user.input';
import { LoginUserResponse } from './dto/login-user.response';
import { LoginUserInput } from './dto/login-user.input';
import { UserResponse } from './dto/user.response';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => UserResponse)
  async registerUser(
    @Args('registerUserInput') registerUserDto: RegisterUserInput,
  ): Promise<UserResponse> {
    return this.authService.registerUser(registerUserDto);
  }

  @Mutation(() => LoginUserResponse)
  async loginUser(
    @Args('loginUserInput') loginUserInput: LoginUserInput,
  ): Promise<LoginUserResponse> {
    return this.authService.loginUser(loginUserInput);
  }

  @Mutation(() => RefreshTokenResponse)
  async refreshToken(
    @Args('refreshToken') refreshToken: string,
  ): Promise<RefreshTokenResponse> {
    return this.authService.refreshToken(refreshToken);
  }
}
