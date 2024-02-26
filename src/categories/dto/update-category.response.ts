import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UpdateCategoryResponse {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;
}
