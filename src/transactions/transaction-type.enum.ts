import { registerEnumType } from '@nestjs/graphql';

export enum TransactionTypeEnum {
  INCOME = 'INCOME',
  EXPENSES = 'EXPENSES',
}

registerEnumType(TransactionTypeEnum, {
  name: 'TransactionTypeEnum',
});
