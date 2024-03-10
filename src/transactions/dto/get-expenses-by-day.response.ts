import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GetExpensesByDayResponse {
  @Field()
  day: string;

  @Field()
  sum: number;
}
