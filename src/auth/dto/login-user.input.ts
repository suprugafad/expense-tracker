import { Field, InputType } from '@nestjs/graphql';
import { IsString, Length, IsEmail } from 'class-validator';

@InputType()
export class LoginUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @Length(6, undefined, {
    message: 'Password must be at least 6 characters long',
  })
  password: string;
}
