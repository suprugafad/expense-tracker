import { DataSource } from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { User } from 'src/auth/entities/user.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { TransactionTypeEnum } from 'src/transactions/transaction-type.enum';
import { CreateTransactionDto } from 'src/transactions/dto/create-transaction.dto';

export async function loadTransactionFixtures(dataSource: DataSource) {
  const transactionRepository = dataSource.getRepository(Transaction);
  const userRepository = dataSource.getRepository(User);
  const categoryRepository = dataSource.getRepository(Category);

  const currentDate = new Date();
  const oneWeekAgoDate = new Date(currentDate);
  oneWeekAgoDate.setDate(currentDate.getDate() - 7);

  const user = await userRepository.findOneBy({ name: 'Test User' });

  if (!user) {
    throw new Error('User not found');
  }

  const category = await categoryRepository.findOneBy({
    name: 'General Category 1',
  });

  const category2 = await categoryRepository.findOneBy({
    name: 'User Category 1',
  });

  const transactions: CreateTransactionDto[] = [
    {
      amount: 100,
      type: TransactionTypeEnum.EXPENSES,
      description: 'Description of the Transaction 1',
      category,
      user,
    },
    {
      amount: 200,
      type: TransactionTypeEnum.EXPENSES,
      description: 'Description of the Transaction 2',
      category,
      user,
      date: oneWeekAgoDate,
    },
    {
      amount: 500,
      type: TransactionTypeEnum.INCOME,
      description: 'Description of the Transaction 3',
      category: category2,
      user,
    },
  ];

  await transactionRepository.save(transactions);
}
