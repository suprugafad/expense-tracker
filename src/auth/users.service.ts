import { ChangeUserPasswordInput } from './dto/change-user-password.input';
import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { RegisterUserInput } from './dto/register-user.input';
import { RegisterUserResponse } from './dto/register-user.response';
import { UsersRepository } from './users.repository';
import { UpdateUserInput } from './dto/update-user.input';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async createUser(
    registerUserInput: RegisterUserInput,
  ): Promise<RegisterUserResponse> {
    // const email = registerUserInput.email;

    //await this.getUserByEmail(email);

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

  async updateUserInfo(
    id: string,
    updateUserInput: UpdateUserInput,
  ): Promise<User> {
    await this.getUserById(id);

    await this.usersRepository.updateUserInfo(id, updateUserInput);

    return await this.usersRepository.findById(id);
  }

  async changeUserPassword(
    id: string,
    changeUserPasswordInput: ChangeUserPasswordInput,
  ): Promise<void> {
    const user = await this.getUserById(id);

    const { oldPassword, newPassword } = changeUserPasswordInput;

    const valid = await bcrypt.compare(oldPassword, user.password);

    if (!valid) {
      throw new Error('Old password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;

    await this.usersRepository.saveUser(user);
  }
}
