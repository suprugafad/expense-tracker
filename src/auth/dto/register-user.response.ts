import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RegisterUserResponse {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;
}
