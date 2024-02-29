import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsUUID, IsDate, IsEnum } from 'class-validator';
import { TransactionTypeEnum } from '../transaction-type.enum';

@InputType()
export class TransactionFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  endDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID('4')
  categoryId?: string;

  @Field(() => TransactionTypeEnum, { nullable: true })
  @IsOptional()
  @IsEnum(TransactionTypeEnum)
  type?: TransactionTypeEnum;
}
