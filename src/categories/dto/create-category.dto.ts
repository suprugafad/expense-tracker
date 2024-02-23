import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @Length(0, 50)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID('4')
  userId: string;
}
