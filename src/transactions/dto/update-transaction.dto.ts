import { InputType } from '@nestjs/graphql';
import {
  IsDate,
  IsEnum,
  IsInstance,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TransactionTypeEnum } from '../transaction-type.enum';
import { Category } from 'src/categories/entities/category.entity';

@InputType()
export class UpdateTransactionDto {
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsEnum(TransactionTypeEnum)
  type?: TransactionTypeEnum;

  @IsOptional()
  @IsDate()
  date?: Date;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ValidateNested()
  @IsInstance(Category)
  category?: Category;
}
