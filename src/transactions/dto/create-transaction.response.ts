import { ObjectType, Field, ID } from '@nestjs/graphql';
import { TransactionTypeEnum } from '../transaction-type.enum';

@ObjectType()
class TransactionCategoryResponse {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;
}

@ObjectType()
export class CreateTransactionResponse {
  @Field(() => ID)
  id: string;

  @Field()
  amount: number;

  @Field(() => TransactionTypeEnum)
  type: TransactionTypeEnum;

  @Field(() => TransactionCategoryResponse)
  category: TransactionCategoryResponse;

  @Field({ nullable: true })
  description?: string;

  @Field()
  date: Date;
}
