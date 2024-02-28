import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsRepository } from './transactions.repository';
import { TransactionsResolver } from './transactions.resolver';
import { CategoriesModule } from 'src/categories/categories.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [CategoriesModule, AuthModule],
  providers: [
    TransactionsService,
    TransactionsRepository,
    TransactionsResolver,
  ],
})
export class TransactionsModule {}
