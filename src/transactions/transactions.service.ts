import { UsersService } from './../auth/users.service';
import { CreateTransactionInput } from './dto/create-transaction.input';
import { TransactionsRepository } from './transactions.repository';
import { Injectable } from '@nestjs/common';
import { CategoriesService } from 'src/categories/categories.service';
import { TransactionResponse } from './dto/transaction.response';
import { TransactionFilterInput } from './dto/transaction-filter.input';

@Injectable()
export class TransactionsService {
  constructor(
    private transactionsRepository: TransactionsRepository,
    private usersService: UsersService,
    private categoryService: CategoriesService,
  ) {}
  async createTransaction(
    userId: string,
    createTransactionInput: CreateTransactionInput,
  ): Promise<TransactionResponse> {
    const user = await this.usersService.getUserById(userId);

    const categoryId = createTransactionInput.categoryId;

    const category = await this.categoryService.getCategoryByIdAndUserId(
      categoryId,
      userId,
    );

    const transaction = await this.transactionsRepository.createTransaction({
      ...createTransactionInput,
      user,
      category,
    });

    return { ...transaction };
  }
  async getUserTransactions(
    userId: string,
    filters?: TransactionFilterInput,
  ): Promise<TransactionResponse[]> {
    return await this.transactionsRepository.findByUserId(userId, filters);
  }
}
