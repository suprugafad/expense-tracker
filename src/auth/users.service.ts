import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { RegisterUserInput } from './dto/register-user.input';
import { RegisterUserResponse } from './dto/register-user.response';
import { UsersRepository } from './users.repository';
import { RefreshTokensRepository } from './refresh-tokens.repository';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private refreshTokensRepository: RefreshTokensRepository,
  ) {}

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

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found.`);
    }

    return user;
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    return user;
  }
}
