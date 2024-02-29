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
export class UpdateTransactionInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @Field(() => TransactionTypeEnum, { nullable: true })
  @IsOptional()
  @IsEnum(TransactionTypeEnum)
  type?: TransactionTypeEnum;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  date?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID('4')
  categoryId?: string;
}
