import { RefreshTokenResponse } from './dto/refresh-token.response';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { RegisterUserResponse } from './dto/register-user.response';
import { RegisterUserInput } from './dto/register-user.input';
import { LoginUserResponse } from './dto/login-user.response';
import { LoginUserInput } from './dto/login-user.input';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => RegisterUserResponse)
  async registerUser(
    @Args('registerUserInput') registerUserDto: RegisterUserInput,
  ): Promise<RegisterUserResponse> {
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
