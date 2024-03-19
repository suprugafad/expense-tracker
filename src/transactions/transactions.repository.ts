import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionFilterInput } from './dto/transaction-filter.input';
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionTypeEnum } from './transaction-type.enum';
import { GetExpensesByDayResponse } from './dto/get-expenses-by-day.response';

@Injectable()
export class TransactionsRepository extends Repository<Transaction> {
  constructor(private dataSource: DataSource) {
    super(Transaction, dataSource.createEntityManager());
  }

  async createTransaction(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const transaction = this.create(createTransactionDto);
    await this.save(transaction);

    return transaction;
  }

  async findByUserId(
    userId: string,
    filters: TransactionFilterInput,
  ): Promise<Transaction[]> {
    let query = this.createQueryBuilder('transaction')
      .where('transaction.user.id = :userId', { userId })
      .orderBy('transaction.date', 'DESC')
      .leftJoinAndSelect('transaction.category', 'category');

    if (filters) {
      if (filters.startDate) {
        query = query.andWhere('transaction.date >= :startDate', {
          startDate: filters.startDate.toISOString(),
        });
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        query = query.andWhere('transaction.date <= :endDate', {
          endDate: endDate.toISOString(),
        });
      }
      if (filters.categoryId) {
        query = query.andWhere('transaction.category.id = :categoryId', {
          categoryId: filters.categoryId,
        });
      }
      if (filters.type) {
        query = query.andWhere('transaction.type = :type', {
          type: filters.type,
        });
      }
      if (filters.limit) {
        query = query.take(filters.limit);
      }
    }

    return await query.getMany();
  }

  async calculateSum(
    type: TransactionTypeEnum,
    userId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const result = await this.createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'sum')
      .where('transaction.user_id = :userId', { userId })
      .andWhere('transaction.type = :type', { type })
      .andWhere('transaction.date >= :startDate', { startDate })
      .andWhere('transaction.date <= :endDate', { endDate })
      .getRawOne();

    return parseFloat(result.sum) || 0;
  }

  async calculateExpensesByDay(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<GetExpensesByDayResponse[]> {
    const results = await this.createQueryBuilder('transaction')
      .select("date_trunc('day', transaction.date)", 'day')
      .addSelect('SUM(transaction.amount)', 'sum')
      .where('transaction.user_id = :userId', { userId })
      .andWhere('transaction.type = :type', {
        type: TransactionTypeEnum.EXPENSES,
      })
      .andWhere('transaction.date BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .groupBy('day')
      .orderBy('day', 'ASC')
      .getRawMany();

    return results.map((row) => ({
      day: row.day,
      sum: parseFloat(row.sum),
    }));
  }

  async findById(id: string): Promise<Transaction> {
    return await this.findOne({ where: { id }, relations: ['category'] });
  }

  async updateTransaction(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<void> {
    await this.update(id, updateTransactionDto);
  }

  async deleteById(id: string) {
    await this.delete(id);
  }
}
