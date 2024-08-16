import { DataSource } from 'typeorm';
import { Category } from '../../src/categories/entities/category.entity';
import { User } from '../../src/auth/entities/user.entity';

export async function loadCategoryFixtures(dataSource: DataSource) {
  const categoryRepository = dataSource.getRepository(Category);
  const userRepository = dataSource.getRepository(User);

  const user = await userRepository.findOneBy({ name: 'Test User' });

  if (!user) {
    throw new Error('User not found');
  }

  const categories = [
    { name: 'General Category 1' },
    { name: 'General Category 2', description: 'This is a general category' },
    { name: 'User Category 1', user },
    { name: 'User Category 2', description: 'This is a user category', user },
  ];

  await categoryRepository.save(categories);
}
