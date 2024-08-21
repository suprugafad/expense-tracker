import { validate } from 'class-validator';
import { CreateCategoryDto } from '../dto/create-category.dto';

describe('CreateCategoryDto', () => {
  const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
  let dto: CreateCategoryDto;

  const createValidDto = (): CreateCategoryDto => {
    const dto = new CreateCategoryDto();
    dto.name = 'Valid Name';
    dto.userId = VALID_UUID;
    dto.description = 'Valid description';
    return dto;
  };

  beforeEach(() => {
    dto = createValidDto();
  });

  it('should validate a valid DTO', async () => {
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should allow undefined for description', async () => {
    dto.description = undefined;

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail validation if name is missing', async () => {
    dto.name = undefined;

    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].constraints?.isString).toBeDefined();
    expect(errors[0].constraints?.isLength).toBeDefined();
  });

  it('should fail validation if userId is missing', async () => {
    dto.userId = undefined;

    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].constraints?.isUuid).toBeDefined();
  });

  it('should fail validation if name is too long (more than 50 symbols)', async () => {
    dto.name = 'a'.repeat(51);

    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].constraints?.isLength).toBeDefined();
  });

  it('should fail validation if userId is not a valid UUID', async () => {
    dto.userId = '123';

    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].constraints?.isUuid).toBeDefined();
  });

  it('should fail validation if name is not a string', async () => {
    dto.name = 123 as any;

    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].constraints?.isString).toBeDefined();
  });

  it('should fail validation if description is not a string', async () => {
    dto.description = 123 as any;

    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].constraints?.isString).toBeDefined();
  });
});
