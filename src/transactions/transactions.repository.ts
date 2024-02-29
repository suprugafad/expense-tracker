import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionFilterInput } from './dto/transaction-filter.input';
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';

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
    }

    return await query.getMany();
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
