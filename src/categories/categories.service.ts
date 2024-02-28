import { UsersService } from './../auth/users.service';
import { UpdateCategoryRequestDto } from './dto/update-category-request.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryResponse } from './dto/create-category.response';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryResponse } from './dto/update-category.response';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    private categoriesRepository: CategoriesRepository,
    private usersService: UsersService,
  ) {}

  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CreateCategoryResponse> {
    const { name, userId } = createCategoryDto;

    const existingCategory =
      await this.categoriesRepository.findByNameAndUserId(name, userId);

    if (existingCategory) {
      throw new NotFoundException(
        `Category with name "${name}" already exist.`,
      );
    }

    const user = await this.usersService.getUserById(userId);

    const category = await this.categoriesRepository.createCategory(
      createCategoryDto,
      user,
    );

    return {
      ...category,
    };
  }

  async getUserCategories(userId: string): Promise<Category[]> {
    return await this.categoriesRepository.findUserCategories(userId);
  }

  async getCategoryByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<Category> {
    const category = await this.categoriesRepository.findByIdAndUserId(
      id,
      userId,
    );

    if (!category) {
      throw new NotFoundException(`Custom category with id "${id}" not exist.`);
    }

    return category;
  }

  async updateCategory(
    { id, userId }: UpdateCategoryRequestDto,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<UpdateCategoryResponse> {
    await this.getCategoryByIdAndUserId(id, userId);

    await this.categoriesRepository.updateCategory(id, updateCategoryDto);

    return await this.categoriesRepository.findById(id);
  }

  async deleteCategory(id: string, userId: string): Promise<void> {
    await this.getCategoryByIdAndUserId(id, userId);

    await this.categoriesRepository.deleteById(id);
  }
}
