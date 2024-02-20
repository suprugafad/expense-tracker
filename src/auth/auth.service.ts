import { RegisterUserInput } from './dto/register-user.input';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterUserResponse } from './dto/register-user.response';
import { UsersService } from './users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async registerUser(
    registerUserInput: RegisterUserInput,
  ): Promise<RegisterUserResponse> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(registerUserInput.password, salt);
    registerUserInput.password = hashedPassword;

    return this.usersService.createUser(registerUserInput);
  }
}
