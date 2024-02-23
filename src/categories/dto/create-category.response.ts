import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CreateCategoryResponse {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;
}
