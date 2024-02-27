import { Field, InputType } from '@nestjs/graphql';
import {
  IsString,
  Length,
  IsEmail,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @Length(4, 50, { message: 'Name must be from 4 to 50 characters' })
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  @Length(7, 255)
  email: string;
}
