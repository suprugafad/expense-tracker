import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.findOne({ where: { email } });
  }

  async createUser(
    email: string,
    name: string,
    password: string,
  ): Promise<User> {
    const user = this.create({ email, name, password });
    await this.save(user);
    return user;
  }
}
