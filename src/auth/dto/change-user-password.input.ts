import { Field, InputType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';

@InputType()
export class ChangeUserPasswordInput {
  @Field()
  @IsString()
  @Length(6, 255, {
    message: 'Password must be from 6 to 255 characters long',
  })
  oldPassword: string;

  @Field()
  @IsString()
  @Length(6, 255, {
    message: 'Password must be from 6 to 255 characters long',
  })
  newPassword: string;
}
