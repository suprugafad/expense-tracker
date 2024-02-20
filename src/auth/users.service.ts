import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { RegisterUserInput } from './dto/register-user.input';
import { RegisterUserResponse } from './dto/register-user.response';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async createUser(
    registerUserDto: RegisterUserInput,
  ): Promise<RegisterUserResponse> {
    const { email, name, password } = registerUserDto;

    const existingUser = await this.usersRepository.findByEmail(email);

    if (existingUser) {
      throw new Error(`User with email ${email} already exist.`);
    }

    const user = await this.usersRepository.createUser(email, name, password);

    return { id: user.id, email: user.email, name: user.name };
  }

  async getUser(email: string): Promise<User> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found.`);
    }

    return user;
  }
}
