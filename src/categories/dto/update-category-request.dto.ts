import { IsUUID } from 'class-validator';

export class UpdateCategoryRequestDto {
  @IsUUID('4')
  id: string;

  @IsUUID('4')
  userId: string;
}
