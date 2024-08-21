import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager, SelectQueryBuilder } from 'typeorm';
import { CategoriesRepository } from '../categories.repository';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { User } from 'src/auth/entities/user.entity';
import { mock, MockProxy } from 'jest-mock-extended';
import { UpdateCategoryInput } from '../dto/update-category.input';

describe('CategoriesRepository', () => {
  let repository: CategoriesRepository;
  let dataSourceMock: MockProxy<DataSource>;
  let entityManagerMock: MockProxy<EntityManager>;
  let queryBuilderMock: MockProxy<SelectQueryBuilder<Category>>;
  let connectionMock: MockProxy<any>;

  const categoryName = 'Test Category';
  const categoryDescription = 'Description of the Category';

  const createUser = (): User => {
    const user = new User();
    user.id = '1';
    return user;
  };

  const createCategoryDto = (
    userId: string,
    description?: string,
  ): CreateCategoryDto => ({
    name: categoryName,
    userId,
    description,
  });

  const createExpectedCategory = (
    dto: CreateCategoryDto,
    user: User,
  ): Category =>
    ({
      id: '1',
      ...dto,
      user,
    } as Category);

  const user = createUser();

  beforeEach(async () => {
    queryBuilderMock = mock<SelectQueryBuilder<Category>>();
    queryBuilderMock.leftJoinAndSelect.mockReturnThis();
    queryBuilderMock.where.mockReturnThis();
    queryBuilderMock.getMany.mockResolvedValue([]);

    connectionMock = mock<any>();
    connectionMock.getMetadata.mockReturnValue({});

    entityManagerMock = mock<EntityManager>();
    entityManagerMock.createQueryBuilder.mockReturnValue(queryBuilderMock);

    Object.defineProperty(entityManagerMock, 'connection', {
      get: jest.fn(() => connectionMock),
    });

    dataSourceMock = mock<DataSource>();
    dataSourceMock.createEntityManager.mockReturnValue(entityManagerMock);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesRepository,
        { provide: DataSource, useValue: dataSourceMock },
      ],
    }).compile();

    repository = module.get<CategoriesRepository>(CategoriesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const dto = createCategoryDto(user.id);
      const expectedCategory = createExpectedCategory(dto, user);

      const createSpy = jest
        .spyOn(repository, 'create')
        .mockReturnValue(expectedCategory);
      const saveSpy = jest
        .spyOn(repository, 'save')
        .mockResolvedValue(expectedCategory);

      const category = await repository.createCategory(dto, user);

      expect(createSpy).toHaveBeenCalledWith({
        ...dto,
        user,
      });
      expect(saveSpy).toHaveBeenCalledWith(expectedCategory);
      expect(category).toBeDefined();
      expect(category.name).toBe(dto.name);
      expect(category.user.id).toBe(user.id);
    });

    it('should create a new category with description', async () => {
      const dto = createCategoryDto(user.id, categoryDescription);
      const expectedCategory = createExpectedCategory(dto, user);

      const createSpy = jest
        .spyOn(repository, 'create')
        .mockReturnValue(expectedCategory);
      const saveSpy = jest
        .spyOn(repository, 'save')
        .mockResolvedValue(expectedCategory);

      const category = await repository.createCategory(dto, user);

      expect(createSpy).toHaveBeenCalledWith({
        ...dto,
        user,
      });
      expect(saveSpy).toHaveBeenCalledWith(expectedCategory);
      expect(category).toBeDefined();
      expect(category.name).toBe(dto.name);
      expect(category.description).toBe(dto.description);
      expect(category.user.id).toBe(user.id);
    });

    it('should handle error when saving category', async () => {
      const dto = createCategoryDto(user.id);
      const expectedCategory = createExpectedCategory(dto, user);

      const createSpy = jest
        .spyOn(repository, 'create')
        .mockReturnValue(expectedCategory);
      const saveSpy = jest
        .spyOn(repository, 'save')
        .mockRejectedValue(new Error('Database error'));

      await expect(repository.createCategory(dto, user)).rejects.toThrow(
        'Database error',
      );
      expect(createSpy).toHaveBeenCalledWith({
        ...dto,
        user,
      });
      expect(saveSpy).toHaveBeenCalledWith(expectedCategory);
    });
  });

  describe('findById', () => {
    const id = '1';

    it('should find and return a category by id', async () => {
      const expectedCategory = createExpectedCategory(
        createCategoryDto(user.id),
        user,
      );

      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(expectedCategory);

      const category = await repository.findById(id);

      expect(findOneSpy).toHaveBeenCalledWith({ where: { id } });
      expect(category).toEqual(expectedCategory);
    });

    it('should return null if category not found', async () => {
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(undefined);

      const category = await repository.findById(id);

      expect(findOneSpy).toHaveBeenCalledWith({ where: { id } });
      expect(category).toBeUndefined();
    });

    it('should handle error when finding category', async () => {
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockRejectedValue(new Error('Database error'));

      await expect(repository.findById(id)).rejects.toThrow('Database error');
      expect(findOneSpy).toHaveBeenCalledWith({ where: { id } });
    });
  });

  describe('findUserCategories', () => {
    const expectedCategories: Category[] = [
      createExpectedCategory(createCategoryDto(user.id), user),
      createExpectedCategory(createCategoryDto(user.id), null),
    ];

    it('should find and return categories by userId', async () => {
      queryBuilderMock.getMany.mockResolvedValue(expectedCategories);

      const categories = await repository.findUserCategories(user.id);

      expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenCalledWith(
        'category.user',
        'user',
      );
      expect(queryBuilderMock.where).toHaveBeenCalledWith(
        'category.user.id = :userId OR category.user.id IS NULL',
        { userId: user.id },
      );
      expect(queryBuilderMock.getMany).toHaveBeenCalled();
      expect(categories).toEqual(expectedCategories);
    });
  });

  describe('findByIdAndUserId', () => {
    const id = '1';

    it('should find and return a category by id and userId', async () => {
      const expectedCategory = createExpectedCategory(
        createCategoryDto(user.id),
        user,
      );

      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(expectedCategory);

      const category = await repository.findByIdAndUserId(id, user.id);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { id, user: { id: user.id } },
      });
      expect(category).toEqual(expectedCategory);
    });

    it('should return undefined if category not found by id and userId', async () => {
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(undefined);

      const category = await repository.findByIdAndUserId(id, user.id);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { id, user: { id: user.id } },
      });
      expect(category).toBeUndefined();
    });

    it('should handle error when finding category by id and userId', async () => {
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockRejectedValue(new Error('Database error'));

      await expect(repository.findByIdAndUserId(id, user.id)).rejects.toThrow(
        'Database error',
      );
      expect(findOneSpy).toHaveBeenCalledWith({
        where: { id, user: { id: user.id } },
      });
    });
  });

  describe('findByNameAndUserId', () => {
    it('should find and return a category by name and userId', async () => {
      const expectedCategory = createExpectedCategory(
        createCategoryDto(user.id),
        user,
      );

      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(expectedCategory);

      const category = await repository.findByNameAndUserId(
        categoryName,
        user.id,
      );

      expect(findOneSpy).toHaveBeenCalledWith({
        where: [
          { name: categoryName, user: { id: user.id } },
          { name: categoryName, user: null },
        ],
      });
      expect(category).toEqual(expectedCategory);
    });

    it('should find and return a general category by name', async () => {
      const expectedCategory = createExpectedCategory(
        createCategoryDto(null),
        null,
      );

      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(expectedCategory);

      const category = await repository.findByNameAndUserId(categoryName, null);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: [
          { name: categoryName, user: { id: null } },
          { name: categoryName, user: null },
        ],
      });
      expect(category).toEqual(expectedCategory);
    });

    it('should return undefined if general category not found by name', async () => {
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(undefined);

      const category = await repository.findByNameAndUserId(categoryName, null);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: [
          { name: categoryName, user: { id: null } },
          { name: categoryName, user: null },
        ],
      });
      expect(category).toBeUndefined();
    });

    it('should return undefined if category not found by name and userId', async () => {
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(undefined);

      const category = await repository.findByNameAndUserId(
        categoryName,
        user.id,
      );

      expect(findOneSpy).toHaveBeenCalledWith({
        where: [
          { name: categoryName, user: { id: user.id } },
          { name: categoryName, user: null },
        ],
      });
      expect(category).toBeUndefined();
    });

    it('should handle error when finding category by name and userId', async () => {
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockRejectedValue(new Error('Database error'));

      await expect(
        repository.findByNameAndUserId(categoryName, user.id),
      ).rejects.toThrow('Database error');
      expect(findOneSpy).toHaveBeenCalledWith({
        where: [
          { name: categoryName, user: { id: user.id } },
          { name: categoryName, user: null },
        ],
      });
    });
  });

  describe('updateCategory', () => {
    const id = '1';
    const baseUpdateCategoryInput: UpdateCategoryInput = {
      name: 'Updated Category',
      description: 'Updated Description',
    };

    it('should update category successfully', async () => {
      const updateSpy = jest
        .spyOn(repository, 'update')
        .mockResolvedValue(undefined);

      await repository.updateCategory(id, baseUpdateCategoryInput);

      expect(updateSpy).toHaveBeenCalledWith(id, baseUpdateCategoryInput);
    });

    it('should handle error when updating category', async () => {
      const updateSpy = jest
        .spyOn(repository, 'update')
        .mockRejectedValue(new Error('Database error'));

      await expect(
        repository.updateCategory(id, baseUpdateCategoryInput),
      ).rejects.toThrow('Database error');
      expect(updateSpy).toHaveBeenCalledWith(id, baseUpdateCategoryInput);
    });

    it('should update category without description', async () => {
      const updateCategoryInput: UpdateCategoryInput = {
        name: 'Updated Category',
      };
      const updateSpy = jest
        .spyOn(repository, 'update')
        .mockResolvedValue(undefined);

      await repository.updateCategory(id, updateCategoryInput);

      expect(updateSpy).toHaveBeenCalledWith(id, updateCategoryInput);
    });

    it('should update category without name', async () => {
      const updateCategoryInput: UpdateCategoryInput = {
        description: 'Updated Description',
      };
      const updateSpy = jest
        .spyOn(repository, 'update')
        .mockResolvedValue(undefined);

      await repository.updateCategory(id, updateCategoryInput);

      expect(updateSpy).toHaveBeenCalledWith(id, updateCategoryInput);
    });

    it('should update category with empty input', async () => {
      const updateCategoryInput: UpdateCategoryInput = {};
      const updateSpy = jest
        .spyOn(repository, 'update')
        .mockResolvedValue(undefined);

      await repository.updateCategory(id, updateCategoryInput);

      expect(updateSpy).toHaveBeenCalledWith(id, updateCategoryInput);
    });
  });

  describe('deleteById', () => {
    const id = '1';

    it('should delete category successfully', async () => {
      const deleteSpy = jest
        .spyOn(repository, 'delete')
        .mockResolvedValue(undefined);

      await repository.deleteById(id);

      expect(deleteSpy).toHaveBeenCalledWith(id);
    });

    it('should handle error when deleting category', async () => {
      const deleteSpy = jest
        .spyOn(repository, 'delete')
        .mockRejectedValue(new Error('Database error'));

      await expect(repository.deleteById(id)).rejects.toThrow('Database error');
      expect(deleteSpy).toHaveBeenCalledWith(id);
    });
  });
});
