import { Field, InputType } from '@nestjs/graphql';
import { IsString, Length, IsEmail } from 'class-validator';

@InputType()
export class RegisterUserInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @Length(6)
  password: string;
}
