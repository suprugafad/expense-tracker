import { UpdateCategoryRequestDto } from './dto/update-category-request.dto';
import { Injectable } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryResponse } from './dto/create-category.response';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryResponse } from './dto/update-category.response';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CreateCategoryResponse> {
    const { name, userId } = createCategoryDto;

    const existingCategory =
      await this.categoriesRepository.findByNameAndUserId(name, userId);

    if (existingCategory) {
      throw new Error(`Category with name "${name}" already exist.`);
    }

    const category = await this.categoriesRepository.createCategory(
      createCategoryDto,
    );

    return {
      id: category.id,
      name: category.name,
      description: category.description,
    };
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
      throw new Error(`Category with id "${id}" not exist.`);
    }

    await this.categoriesRepository.updateCategory(id, updateCategoryDto);

    return await this.categoriesRepository.findById(id);
  }
}
