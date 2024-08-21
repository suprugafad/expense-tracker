import { validate } from 'class-validator';
import { UpdateCategoryRequestDto } from '../dto/update-category-request.dto';

describe('UpdateCategoryRequestDto', () => {
  const VALID_UUID_1 = '550e8400-e29b-41d4-a716-446655440001';
  const VALID_UUID_2 = '550e8400-e29b-41d4-a716-446655440002';

  let dto: UpdateCategoryRequestDto;

  const updateValidDto = (): UpdateCategoryRequestDto => {
    const dto = new UpdateCategoryRequestDto();
    dto.id = VALID_UUID_1;
    dto.userId = VALID_UUID_2;
    return dto;
  };

  beforeEach(() => {
    dto = updateValidDto();
  });

  it('should validate a valid DTO', async () => {
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail validation if category id is not a valid UUID', async () => {
    dto.id = '123';
    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].constraints?.isUuid).toBeDefined();
  });

  it('should fail validation if userId is not a valid UUID', async () => {
    dto.userId = '123';
    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].constraints?.isUuid).toBeDefined();
  });
});
