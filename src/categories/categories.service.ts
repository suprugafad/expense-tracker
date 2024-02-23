import { Injectable } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryResponse } from './dto/create-category.response';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private categoriesRepository: CategoriesRepository) {}
  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CreateCategoryResponse> {
    const { name, userId } = createCategoryDto;
    console.log(createCategoryDto);

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
}
