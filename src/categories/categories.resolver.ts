import { CategoriesService } from './categories.service';
import { Args, Resolver, Mutation, Context, ID, Query } from '@nestjs/graphql';
import { CreateCategoryResponse } from './dto/create-category.response';
import { CreateCategoryInput } from './dto/create-category.input';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { UpdateCategoryResponse } from './dto/update-category.response';
import { UpdateCategoryInput } from './dto/update-category.input';
import { UpdateCategoryRequestDto } from './dto/update-category-request.dto';
import { Category } from './entities/category.entity';

@Resolver()
export class CategoriesResolver {
  constructor(private categoriesService: CategoriesService) {}

  @Mutation(() => CreateCategoryResponse)
  @UseGuards(JwtAuthGuard)
  async createCategory(
    @Args('createCategoryInput') createCategoryInput: CreateCategoryInput,
    @Context() ctx: any,
  ): Promise<CreateCategoryResponse> {
    const userId = ctx.req.user.id;

    return this.categoriesService.createCategory({
      ...createCategoryInput,
      userId,
    });
  }

  @Mutation(() => UpdateCategoryResponse)
  @UseGuards(JwtAuthGuard)
  async updateCategory(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateCategoryInput') updateCategoryInput: UpdateCategoryInput,
    @Context() ctx: any,
  ): Promise<UpdateCategoryResponse> {
    const userId = ctx.req.user.id;
    const updateCategoryRequestDto: UpdateCategoryRequestDto = {
      id,
      userId,
    };

    return this.categoriesService.updateCategory(
      updateCategoryRequestDto,
      updateCategoryInput,
    );
  }

  @Query(() => [Category])
  @UseGuards(JwtAuthGuard)
  async getUserCategories(@Context() ctx: any): Promise<Category[]> {
    const userId = ctx.req.user.id;
    return this.categoriesService.getUserCategories(userId);
  }
}
