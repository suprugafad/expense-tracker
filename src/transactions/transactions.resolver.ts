import { TransactionsService } from './transactions.service';
import { Args, Context, Mutation, Resolver, Query, ID } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateTransactionInput } from './dto/create-transaction.input';
import { TransactionResponse } from './dto/transaction.response';
import { UseGuards } from '@nestjs/common';
import { TransactionFilterInput } from './dto/transaction-filter.input';
import { UpdateTransactionInput } from './dto/update-transaction.input';
import { DeleteTransactionResponse } from './dto/delete-transaction.response';
import { AccountSummaryResponse } from './dto/account-summary.response';

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

  @Query(() => AccountSummaryResponse)
  @UseGuards(JwtAuthGuard)
  async getAccountSummary(
    @Context() ctx: any,
  ): Promise<AccountSummaryResponse> {
    const userId = ctx.req.user.id;

    return await this.transactionsService.getAccountSummary(userId);
  }

  @Mutation(() => TransactionResponse)
  @UseGuards(JwtAuthGuard)
  async updateTransaction(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateTransactionInput')
    updateTransactionInput: UpdateTransactionInput,
  ): Promise<TransactionResponse> {
    return await this.transactionsService.updateTransaction(
      id,
      updateTransactionInput,
    );
  }

  @Mutation(() => DeleteTransactionResponse)
  @UseGuards(JwtAuthGuard)
  async deleteTransaction(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<DeleteTransactionResponse> {
    await this.transactionsService.deleteTransaction(id);
    return { success: true };
  }
}
