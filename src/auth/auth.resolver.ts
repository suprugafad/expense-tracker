import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { RegisterUserResponse } from './dto/register-user.response';
import { RegisterUserInput } from './dto/register-user.input';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => RegisterUserResponse)
  async registerUser(
    @Args('registerUserInput') registerUserDto: RegisterUserInput,
  ): Promise<RegisterUserResponse> {
    return this.authService.registerUser(registerUserDto);
  }
}
