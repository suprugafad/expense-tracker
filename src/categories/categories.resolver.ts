import { CategoriesService } from './categories.service';
import { Args, Resolver, Mutation, Context, ID, Query } from '@nestjs/graphql';
import { CategoryResponse } from './dto/category.response';
import { CreateCategoryInput } from './dto/create-category.input';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { UpdateCategoryInput } from './dto/update-category.input';
import { UpdateCategoryRequestDto } from './dto/update-category-request.dto';
import { DeleteCategoryResponse } from './dto/delete-category.response';

@Resolver()
export class CategoriesResolver {
  constructor(private categoriesService: CategoriesService) {}

  @Mutation(() => CategoryResponse)
  @UseGuards(JwtAuthGuard)
  async createCategory(
    @Args('createCategoryInput') createCategoryInput: CreateCategoryInput,
    @Context() ctx: any,
  ): Promise<CategoryResponse> {
    const userId = ctx.req.user.id;

    return await this.categoriesService.createCategory({
      ...createCategoryInput,
      userId,
    });
  }

  @Mutation(() => CategoryResponse)
  @UseGuards(JwtAuthGuard)
  async updateCategory(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateCategoryInput') updateCategoryInput: UpdateCategoryInput,
    @Context() ctx: any,
  ): Promise<CategoryResponse> {
    const userId = ctx.req.user.id;

    const updateCategoryRequestDto: UpdateCategoryRequestDto = {
      id,
      userId,
    };

    return await this.categoriesService.updateCategory(
      updateCategoryRequestDto,
      updateCategoryInput,
    );
  }

  @Query(() => [CategoryResponse])
  @UseGuards(JwtAuthGuard)
  async getUserCategories(@Context() ctx: any): Promise<CategoryResponse[]> {
    const userId = ctx.req.user.id;

    return await this.categoriesService.getUserCategories(userId);
  }

  @Mutation(() => DeleteCategoryResponse)
  @UseGuards(JwtAuthGuard)
  async deleteCategory(
    @Args('id', { type: () => ID }) id: string,
    @Context() ctx: any,
  ): Promise<DeleteCategoryResponse> {
    const userId = ctx.req.user.id;

    await this.categoriesService.deleteCategory(id, userId);
    return { success: true };
  }
}
