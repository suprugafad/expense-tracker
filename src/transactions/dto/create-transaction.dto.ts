import {
  IsDate,
  IsDefined,
  IsEnum,
  IsInstance,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TransactionTypeEnum } from '../transaction-type.enum';
import { Category } from 'src/categories/entities/category.entity';
import { User } from 'src/auth/entities/user.entity';

export class CreateTransactionDto {
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(TransactionTypeEnum)
  type: TransactionTypeEnum;

  @IsOptional()
  @IsDate()
  date?: Date;

  @IsDefined()
  @ValidateNested()
  @IsInstance(User)
  user: User;

  @IsDefined()
  @ValidateNested()
  @IsInstance(Category)
  category: Category;
}
