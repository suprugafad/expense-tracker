import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { RegisterUserInput } from './dto/register-user.input';
import { RegisterUserResponse } from './dto/register-user.response';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async createUser(
    registerUserInput: RegisterUserInput,
  ): Promise<RegisterUserResponse> {
    const email = registerUserInput.email;

    const existingUser = await this.usersRepository.findByEmail(email);

    if (existingUser) {
      throw new Error(`User with email ${email} already exist.`);
    }

    const user = await this.usersRepository.createUser(registerUserInput);

    return { id: user.id, email: user.email, name: user.name };
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found.`);
    }

    return user;
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    return user;
  }
}
