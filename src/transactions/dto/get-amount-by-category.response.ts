import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GetAmountByCategoryResponse {
  @Field()
  category: string;

  @Field()
  sum: number;
}
