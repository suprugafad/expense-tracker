import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from '../categories.service';
import { CategoriesRepository } from '../categories.repository';
import { UsersService } from 'src/auth/users.service';
import { NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoriesRepository: Partial<
    Record<keyof CategoriesRepository, jest.Mock>
  >;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;

  const userId = 'user1';
  const categoryId = '1';

  const categoryName = 'Test Category';
  const categoryDescription = 'Description of the Category';
  const updatedName = 'New Name';
  const updatedDescription = 'New Description';

  const notFoundError = new NotFoundException(
    `Custom category with id "${categoryId}" not exist.`,
  );
  const userNotFoundError = new NotFoundException(
    `User with ID ${userId} not found.`,
  );
  const databaseError = new Error('Database error');

  const categoryResponse = {
    id: categoryId,
    name: categoryName,
    description: categoryDescription,
  };

  beforeEach(async () => {
    categoriesRepository = {
      findByNameAndUserId: jest.fn(),
      createCategory: jest.fn(),
      findByIdAndUserId: jest.fn(),
      updateCategory: jest.fn(),
      findById: jest.fn(),
      findUserCategories: jest.fn(),
      deleteById: jest.fn(),
    };

    usersService = {
      getUserById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: CategoriesRepository,
          useValue: categoriesRepository,
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCategory', () => {
    const createCategoryDto = {
      name: 'Test Category',
      userId,
    };

    beforeEach(() => {
      jest.clearAllMocks();
      categoriesRepository.findByNameAndUserId.mockResolvedValue(null);
      usersService.getUserById.mockResolvedValue({ id: userId });
    });

    it('should throw an error if the category already exists', async () => {
      categoriesRepository.findByNameAndUserId.mockResolvedValue({
        id: categoryId,
        name: 'Test Category',
      });

      await expect(service.createCategory(createCategoryDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(categoriesRepository.findByNameAndUserId).toHaveBeenCalledWith(
        'Test Category',
        userId,
      );
    });

    it('should throw an error if the user does not exist', async () => {
      usersService.getUserById.mockRejectedValue(userNotFoundError);

      await expect(service.createCategory(createCategoryDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(usersService.getUserById).toHaveBeenCalledWith(userId);
    });

    it('should throw an error if createCategory repository method fails', async () => {
      categoriesRepository.createCategory.mockRejectedValue(databaseError);

      await expect(service.createCategory(createCategoryDto)).rejects.toThrow(
        Error,
      );
      expect(categoriesRepository.createCategory).toHaveBeenCalledWith(
        createCategoryDto,
        { id: userId },
      );
    });

    it('should create a category if it does not exist', async () => {
      categoriesRepository.createCategory.mockResolvedValue({
        id: categoryId,
        name: 'Test Category',
      });

      const result = await service.createCategory(createCategoryDto);

      expect(result).toEqual({ id: categoryId, name: 'Test Category' });
      expect(categoriesRepository.createCategory).toHaveBeenCalledWith(
        createCategoryDto,
        { id: userId },
      );
    });
  });

  describe('getCategoryByIdAndUserId', () => {
    it("should throw an error if the category doesn't exist", async () => {
      categoriesRepository.findByIdAndUserId.mockResolvedValue(null);

      await expect(
        service.getCategoryByIdAndUserId(categoryId, userId),
      ).rejects.toThrow(notFoundError);

      expect(categoriesRepository.findByIdAndUserId).toHaveBeenCalledWith(
        categoryId,
        userId,
      );
    });

    it('should throw an error if findByIdAndUserId repository method fails', async () => {
      categoriesRepository.findByIdAndUserId.mockRejectedValue(databaseError);

      await expect(
        service.getCategoryByIdAndUserId(categoryId, userId),
      ).rejects.toThrow(Error);

      expect(categoriesRepository.findByIdAndUserId).toHaveBeenCalledWith(
        categoryId,
        userId,
      );
    });

    it('should return a category', async () => {
      categoriesRepository.findByIdAndUserId.mockResolvedValue(
        categoryResponse,
      );

      const result = await service.getCategoryByIdAndUserId(categoryId, userId);

      expect(result).toEqual(categoryResponse);
      expect(categoriesRepository.findByIdAndUserId).toHaveBeenCalledWith(
        categoryId,
        userId,
      );
    });
  });

  describe('updateCategory', () => {
    const updateCategoryRequestDto = {
      id: categoryId,
      userId,
    };

    const updateCategoryInput = {
      name: updatedName,
      description: updatedDescription,
    };

    const updatedCategoryResponse = {
      id: categoryId,
      name: updatedName,
      description: updatedDescription,
    };

    beforeEach(() => {
      categoriesRepository.findByIdAndUserId.mockResolvedValue(
        categoryResponse,
      );
      categoriesRepository.updateCategory.mockResolvedValue(undefined);
      categoriesRepository.findById.mockResolvedValue(updatedCategoryResponse);
    });

    it("should throw an error if the category doesn't exist", async () => {
      categoriesRepository.findByIdAndUserId.mockResolvedValue(null);

      await expect(
        service.updateCategory(updateCategoryRequestDto, updateCategoryInput),
      ).rejects.toThrow(notFoundError);

      expect(categoriesRepository.findByIdAndUserId).toHaveBeenCalledWith(
        updateCategoryRequestDto.id,
        updateCategoryRequestDto.userId,
      );
    });

    it('should throw an error if findByIdAndUserId repository method fails', async () => {
      categoriesRepository.findByIdAndUserId.mockRejectedValue(databaseError);

      await expect(
        service.updateCategory(updateCategoryRequestDto, updateCategoryInput),
      ).rejects.toThrow(Error);

      expect(categoriesRepository.findByIdAndUserId).toHaveBeenCalledWith(
        updateCategoryRequestDto.id,
        updateCategoryRequestDto.userId,
      );
    });

    it('should throw an error if updateCategory repository method fails', async () => {
      categoriesRepository.updateCategory.mockRejectedValue(databaseError);

      await expect(
        service.updateCategory(updateCategoryRequestDto, updateCategoryInput),
      ).rejects.toThrow(Error);

      expect(categoriesRepository.findByIdAndUserId).toHaveBeenCalledWith(
        updateCategoryRequestDto.id,
        updateCategoryRequestDto.userId,
      );
      expect(categoriesRepository.updateCategory).toHaveBeenCalledWith(
        updateCategoryRequestDto.id,
        updateCategoryInput,
      );
    });

    it('should throw an error if findById repository method fails', async () => {
      categoriesRepository.findById.mockRejectedValue(databaseError);

      await expect(
        service.updateCategory(updateCategoryRequestDto, updateCategoryInput),
      ).rejects.toThrow(Error);

      expect(categoriesRepository.findByIdAndUserId).toHaveBeenCalledWith(
        updateCategoryRequestDto.id,
        updateCategoryRequestDto.userId,
      );
      expect(categoriesRepository.updateCategory).toHaveBeenCalledWith(
        updateCategoryRequestDto.id,
        updateCategoryInput,
      );
      expect(categoriesRepository.findById).toHaveBeenCalledWith(
        updateCategoryRequestDto.id,
      );
    });

    it('should update only the category description', async () => {
      const partialUpdateCategoryInput = {
        description: updatedDescription,
      };

      const partialUpdatedCategoryResponse = {
        id: categoryId,
        name: categoryName,
        description: updatedDescription,
      };

      categoriesRepository.findById.mockResolvedValue(
        partialUpdatedCategoryResponse,
      );

      const result = await service.updateCategory(
        updateCategoryRequestDto,
        partialUpdateCategoryInput,
      );

      expect(result).toEqual(partialUpdatedCategoryResponse);
      expect(categoriesRepository.findByIdAndUserId).toHaveBeenCalledWith(
        updateCategoryRequestDto.id,
        updateCategoryRequestDto.userId,
      );
      expect(categoriesRepository.updateCategory).toHaveBeenCalledWith(
        updateCategoryRequestDto.id,
        partialUpdateCategoryInput,
      );
      expect(categoriesRepository.findById).toHaveBeenCalledWith(
        updateCategoryRequestDto.id,
      );
    });

    it('should update the category name and description', async () => {
      const result = await service.updateCategory(
        updateCategoryRequestDto,
        updateCategoryInput,
      );

      expect(result).toEqual(updatedCategoryResponse);
      expect(categoriesRepository.findByIdAndUserId).toHaveBeenCalledWith(
        updateCategoryRequestDto.id,
        updateCategoryRequestDto.userId,
      );
      expect(categoriesRepository.updateCategory).toHaveBeenCalledWith(
        updateCategoryRequestDto.id,
        updateCategoryInput,
      );
      expect(categoriesRepository.findById).toHaveBeenCalledWith(
        updateCategoryRequestDto.id,
      );
    });
  });

  describe('getUserCategories', () => {
    const categoriesResponse = [
      {
        id: '1',
        name: 'Test Category 1',
        description: 'Description of the Category 1',
      },
      {
        id: '2',
        name: 'Test Category 2',
        description: 'Description of the Category 2',
      },
    ];

    it('should throw an error if findUserCategories repository method fails', async () => {
      categoriesRepository.findUserCategories.mockRejectedValue(databaseError);

      await expect(service.getUserCategories(userId)).rejects.toThrow(Error);

      expect(categoriesRepository.findUserCategories).toHaveBeenCalledWith(
        userId,
      );
    });

    it("should return user's categories", async () => {
      categoriesRepository.findUserCategories.mockResolvedValue(
        categoriesResponse,
      );

      const result = await service.getUserCategories(userId);

      expect(result).toEqual(categoriesResponse);
      expect(categoriesRepository.findUserCategories).toHaveBeenCalledWith(
        userId,
      );
    });
  });

  describe('getCategoryById', () => {
    it("should return null if the category doesn't exist", async () => {
      categoriesRepository.findById.mockResolvedValue(null);

      const result = await service.getCategoryById(categoryId);

      expect(result).toEqual(null);
      expect(categoriesRepository.findById).toHaveBeenCalledWith(categoryId);
    });

    it('should throw an error if findById repository method fails', async () => {
      categoriesRepository.findById.mockRejectedValue(databaseError);

      await expect(service.getCategoryById(categoryId)).rejects.toThrow(Error);
      expect(categoriesRepository.findById).toHaveBeenCalledWith(categoryId);
    });

    it('should return a category', async () => {
      categoriesRepository.findById.mockResolvedValue(categoryResponse);

      const result = await service.getCategoryById(categoryId);

      expect(result).toEqual(categoryResponse);
      expect(categoriesRepository.findById).toHaveBeenCalledWith(categoryId);
    });
  });

  describe('deleteCategory', () => {
    it("should throw an error if the category doesn't exist", async () => {
      categoriesRepository.findByIdAndUserId.mockResolvedValue(null);

      await expect(service.deleteCategory(categoryId, userId)).rejects.toThrow(
        notFoundError,
      );

      expect(categoriesRepository.findByIdAndUserId).toHaveBeenCalledWith(
        categoryId,
        userId,
      );
    });

    it('should throw an error if findByIdAndUserId repository method fails', async () => {
      categoriesRepository.findByIdAndUserId.mockRejectedValue(databaseError);

      await expect(service.deleteCategory(categoryId, userId)).rejects.toThrow(
        Error,
      );

      expect(categoriesRepository.findByIdAndUserId).toHaveBeenCalledWith(
        categoryId,
        userId,
      );
    });

    it('should throw an error if deleteById repository method fails', async () => {
      categoriesRepository.findByIdAndUserId.mockResolvedValue(
        categoryResponse,
      );
      categoriesRepository.deleteById.mockRejectedValue(databaseError);

      await expect(service.deleteCategory(categoryId, userId)).rejects.toThrow(
        Error,
      );

      expect(categoriesRepository.findByIdAndUserId).toHaveBeenCalledWith(
        categoryId,
        userId,
      );
      expect(categoriesRepository.deleteById).toHaveBeenCalledWith(categoryId);
    });

    it('should delete category', async () => {
      categoriesRepository.findByIdAndUserId.mockResolvedValue(
        categoryResponse,
      );
      categoriesRepository.deleteById.mockResolvedValue(undefined);

      const result = await service.deleteCategory(categoryId, userId);

      expect(result).toEqual(undefined);
      expect(categoriesRepository.findByIdAndUserId).toHaveBeenCalledWith(
        categoryId,
        userId,
      );
      expect(categoriesRepository.deleteById).toHaveBeenCalledWith(categoryId);
    });
  });
});
