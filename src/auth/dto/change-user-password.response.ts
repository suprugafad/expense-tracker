import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ChangeUserPasswordResponse {
  @Field()
  success: boolean;
}
