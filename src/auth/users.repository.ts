import { UpdateUserInput } from './dto/update-user.input';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Injectable } from '@nestjs/common';
import { RegisterUserInput } from './dto/register-user.input';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | undefined> {
    return await this.findOne({ where: { id } });
  }

  async createUser(registerUserInput: RegisterUserInput): Promise<User> {
    const user = this.create(registerUserInput);
    await this.save(user);
    return user;
  }

  async updateUserInfo(
    id: string,
    updateUserInput: UpdateUserInput,
  ): Promise<void> {
    await this.update(id, updateUserInput);
  }
}
