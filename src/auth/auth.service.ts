import { RegisterUserInput } from './dto/register-user.input';
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterUserResponse } from './dto/register-user.response';
import { UsersService } from './users.service';
import { LoginUserInput } from './dto/login-user.input';
import { LoginUserResponse } from './dto/login-user.response';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async registerUser(
    registerUserInput: RegisterUserInput,
  ): Promise<RegisterUserResponse> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(registerUserInput.password, salt);
    registerUserInput.password = hashedPassword;

    return this.usersService.createUser(registerUserInput);
  }

  async loginUser(loginUserInput: LoginUserInput): Promise<LoginUserResponse> {
    const { email, password } = loginUserInput;

    const user = await this.usersService.getUserByEmail(email);

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException(
        `Invalid credentials for user with email ${email}`,
      );
    }

    const access_token = await this.jwtService.sign({
      username: user.name,
      sub: user.id,
    });

    if (!access_token) {
      throw new InternalServerErrorException();
    }

    return { access_token };
  }
}
