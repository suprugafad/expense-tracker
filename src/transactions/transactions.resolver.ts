import { TransactionsService } from './transactions.service';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateTransactionInput } from './dto/create-transaction.input';
import { CreateTransactionResponse } from './dto/create-transaction.response';
import { UseGuards } from '@nestjs/common';

@Resolver()
export class TransactionsResolver {
  constructor(private transactionsService: TransactionsService) {}

  @Mutation(() => CreateTransactionResponse)
  @UseGuards(JwtAuthGuard)
  async createTransaction(
    @Args('createTransactionInput')
    createTransactionInput: CreateTransactionInput,
    @Context() ctx: any,
  ): Promise<CreateTransactionResponse> {
    const userId = ctx.req.user.id;

    return await this.transactionsService.createTransaction(userId, {
      ...createTransactionInput,
    });
  }
}
