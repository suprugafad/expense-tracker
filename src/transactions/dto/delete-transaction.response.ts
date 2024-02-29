import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DeleteTransactionResponse {
  @Field()
  success: boolean;
}
