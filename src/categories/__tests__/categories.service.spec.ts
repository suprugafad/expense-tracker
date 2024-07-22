import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from '../categories.service';
import { CategoriesRepository } from '../categories.repository';
import { UsersService } from 'src/auth/users.service';
import { NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoriesRepository: Partial<Record<keyof CategoriesRepository, jest.Mock>>;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;

  beforeEach(async () => {
    categoriesRepository = {
      findByNameAndUserId: jest.fn(),
      createCategory: jest.fn(),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCategory', () => {
    const createCategoryDto = { 
      name: 'Test Category', 
      userId: 'user1', 
    };

    beforeEach(() => {
      categoriesRepository.findByNameAndUserId.mockResolvedValue(null);
      usersService.getUserById.mockResolvedValue({ id: 'user1' });
    });

    it('should throw an error if the category already exists', async () => {
      categoriesRepository.findByNameAndUserId.mockResolvedValue({ id: '1', name: 'Test Category' });

      await expect(service.createCategory(createCategoryDto)).rejects.toThrow(NotFoundException);
      expect(categoriesRepository.findByNameAndUserId).toHaveBeenCalledWith('Test Category', 'user1');
    });

    it('should throw an error if the user does not exist', async () => {
      usersService.getUserById.mockRejectedValue(new NotFoundException(`User with ID user1 not found.`));

      await expect(service.createCategory(createCategoryDto)).rejects.toThrow(NotFoundException);
      expect(usersService.getUserById).toHaveBeenCalledWith('user1');
    });

    it('should throw an error if createCategory repository method fails', async () => {
      categoriesRepository.createCategory.mockRejectedValue(new Error('Database error'));

      await expect(service.createCategory(createCategoryDto)).rejects.toThrow(Error);
      expect(categoriesRepository.createCategory).toHaveBeenCalledWith(createCategoryDto, { id: 'user1' });
    });

    it('should create a category if it does not exist', async () => {
      categoriesRepository.createCategory.mockResolvedValue({ id: '1', name: 'Test Category' });

      const result = await service.createCategory(createCategoryDto);

      expect(result).toEqual({ id: '1', name: 'Test Category' });
      expect(categoriesRepository.createCategory).toHaveBeenCalledWith(createCategoryDto, { id: 'user1' });
    });
  });
});
