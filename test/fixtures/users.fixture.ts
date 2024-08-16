import { DataSource } from 'typeorm';
import { User } from '../../src/auth/entities/user.entity';
import * as bcrypt from 'bcrypt';

export async function loadUserFixtures(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('password', salt);

  const users = [
    { name: 'Test User', email: 'test@gmail.com', password: hashedPassword },
  ];

  await userRepository.save(users);
}
