import { UpdateTransactionInput } from './dto/update-transaction.input';
import { UsersService } from './../auth/users.service';
import { CreateTransactionInput } from './dto/create-transaction.input';
import { TransactionsRepository } from './transactions.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesService } from 'src/categories/categories.service';
import { TransactionResponse } from './dto/transaction.response';
import { TransactionFilterInput } from './dto/transaction-filter.input';
import { Transaction } from './entities/transaction.entity';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { AccountSummaryResponse } from './dto/account-summary.response';
import { TransactionTypeEnum } from './transaction-type.enum';

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

  async getTransactionById(id: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findById(id);

    if (!transaction) {
      throw new NotFoundException(`Custom category with id "${id}" not exist.`);
    }

    return transaction;
  }

  async getAccountSummary(userId: string): Promise<AccountSummaryResponse> {
    const startDate = new Date();
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();

    const income = await this.transactionsRepository.calculateSum(
      TransactionTypeEnum.INCOME,
      userId,
      startDate,
      endDate,
    );

    const expenses = await this.transactionsRepository.calculateSum(
      TransactionTypeEnum.EXPENSES,
      userId,
      startDate,
      endDate,
    );

    return { income, expenses };
  }

  async updateTransaction(
    id: string,
    updateTransactionInput: UpdateTransactionInput,
  ): Promise<TransactionResponse> {
    await this.getTransactionById(id);

    const { categoryId, ...restOfFields } = updateTransactionInput;

    const updateTransactionDto: UpdateTransactionDto = {
      ...restOfFields,
    };

    if (updateTransactionInput.categoryId) {
      const category = await this.categoryService.getCategoryById(categoryId);

      updateTransactionDto.category = category;
    }

    await this.transactionsRepository.updateTransaction(
      id,
      updateTransactionDto,
    );

    return await this.getTransactionById(id);
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.getTransactionById(id);

    await this.transactionsRepository.deleteById(id);
  }
}
