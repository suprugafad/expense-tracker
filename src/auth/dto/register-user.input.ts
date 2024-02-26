import { Field, InputType } from '@nestjs/graphql';
import { IsString, Length, IsEmail, IsNotEmpty } from 'class-validator';

@InputType()
export class RegisterUserInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @Length(0, 50)
  name: string;

  @Field()
  @IsEmail()
  @Length(0, 255)
  email: string;

  @Field()
  @IsString()
  @Length(6, 255)
  password: string;
}
