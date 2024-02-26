import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DeleteCategoryResponse {
  @Field()
  success: boolean;
}
