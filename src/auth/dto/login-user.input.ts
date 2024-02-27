import { Field, InputType } from '@nestjs/graphql';
import { IsString, Length, IsEmail, IsNotEmpty } from 'class-validator';

@InputType()
export class LoginUserInput {
  @Field()
  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @Length(6, 255, {
    message: 'Password must be from 6 to 255 characters long',
  })
  password: string;
}
