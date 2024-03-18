import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
class TransactionUserResponse {
  @Field(() => ID)
  id: string;
}

@ObjectType()
export class CategoryResponse {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  user?: TransactionUserResponse;
}
