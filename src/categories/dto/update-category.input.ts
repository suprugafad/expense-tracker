import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

@InputType()
export class UpdateCategoryInput {
  @Field()
  @IsUUID('4')
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}
