import { InputType, Field } from '@nestjs/graphql';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { TransactionTypeEnum } from '../transaction-type.enum';

@InputType()
export class CreateTransactionInput {
  @Field()
  @IsNumber()
  amount: number;

  @Field(() => TransactionTypeEnum)
  @IsEnum(TransactionTypeEnum)
  type: TransactionTypeEnum;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field()
  @IsUUID('4')
  categoryId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  date?: Date;
}
