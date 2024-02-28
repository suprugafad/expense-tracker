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

  async findByUserId(userId: string): Promise<Transaction[]> {
    return await this.find({
      where: { user: { id: userId } },
      relations: ['category'],
    });
  }
}
