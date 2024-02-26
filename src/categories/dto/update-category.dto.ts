import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @Length(0, 50)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
