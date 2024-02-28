import { TransactionsService } from './transactions.service';
import { Args, Context, Mutation, Resolver, Query } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateTransactionInput } from './dto/create-transaction.input';
import { TransactionResponse } from './dto/transaction.response';
import { UseGuards } from '@nestjs/common';
import { TransactionFilterInput } from './dto/transaction-filter.input';

@Resolver()
export class TransactionsResolver {
  constructor(private transactionsService: TransactionsService) {}

  @Mutation(() => TransactionResponse)
  @UseGuards(JwtAuthGuard)
  async createTransaction(
    @Args('createTransactionInput')
    createTransactionInput: CreateTransactionInput,
    @Context() ctx: any,
  ): Promise<TransactionResponse> {
    const userId = ctx.req.user.id;

    return await this.transactionsService.createTransaction(userId, {
      ...createTransactionInput,
    });
  }

  @Query(() => [TransactionResponse])
  @UseGuards(JwtAuthGuard)
  async getUserTransactions(
    @Context() ctx: any,
    @Args('filters', { nullable: true }) filters: TransactionFilterInput,
  ): Promise<TransactionResponse[]> {
    const userId = ctx.req.user.id;

    return await this.transactionsService.getUserTransactions(userId, filters);
  }
}
