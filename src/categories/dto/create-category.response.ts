import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CreateCategoryResponse {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description: string;
}
