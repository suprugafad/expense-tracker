import { Field, InputType } from '@nestjs/graphql';
import { IsString, Length, IsEmail, IsNotEmpty } from 'class-validator';

@InputType()
export class RegisterUserInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Name cannot be empty' })
  name: string;

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
