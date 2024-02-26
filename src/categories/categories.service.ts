import { UsersService } from './../auth/users.service';
import { UpdateCategoryRequestDto } from './dto/update-category-request.dto';
import { Injectable } from '@nestjs/common';
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
      throw new Error(`Category with name "${name}" already exist.`);
    }

    const user = await this.usersService.getUserById(userId);

    const category = await this.categoriesRepository.createCategory(
      createCategoryDto,
      user,
    );

    return {
      id: category.id,
      name: category.name,
      description: category.description,
    };
  }

  async getUserCategories(userId: string): Promise<Category[]> {
    return await this.categoriesRepository.findUserCategories(userId);
  }

  async updateCategory(
    { id, userId }: UpdateCategoryRequestDto,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<UpdateCategoryResponse> {
    const existingCategory = await this.categoriesRepository.findByIdAndUserId(
      id,
      userId,
    );

    if (!existingCategory) {
      throw new Error(`Custom category with id "${id}" not exist.`);
    }

    await this.categoriesRepository.updateCategory(id, updateCategoryDto);

    return await this.categoriesRepository.findById(id);
  }

  async deleteCategory(id: string, userId: string): Promise<void> {
    const existingCategory = await this.categoriesRepository.findByIdAndUserId(
      id,
      userId,
    );

    if (!existingCategory) {
      throw new Error(
        `Category with id "${id}" not found or you don't have permission to delete this category.`,
      );
    }

    await this.categoriesRepository.deleteById(id);
  }
}
