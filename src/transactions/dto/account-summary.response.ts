import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AccountSummaryResponse {
  @Field()
  income: number;

  @Field()
  expenses: number;
}
