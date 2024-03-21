import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsDate, IsEnum, IsNumber } from 'class-validator';
import { TransactionTypeEnum } from '../transaction-type.enum';
import { SortOrderEnum } from '../sort-order.enum';

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

  @Field(() => [String], { nullable: true })
  @IsOptional()
  categoryIds?: string[];

  @Field(() => TransactionTypeEnum, { nullable: true })
  @IsOptional()
  @IsEnum(TransactionTypeEnum)
  type?: TransactionTypeEnum;

  @Field(() => SortOrderEnum, { defaultValue: SortOrderEnum.NEWEST })
  @IsEnum(SortOrderEnum)
  sortOrder: SortOrderEnum;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  limit?: number;
}
