import { CategoriesService } from './categories.service';
import { Args, Resolver, Mutation, Context } from '@nestjs/graphql';
import { CreateCategoryResponse } from './dto/create-category.response';
import { CreateCategoryInput } from './dto/create-category.input';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { UpdateCategoryResponse } from './dto/update-category.response';
import { UpdateCategoryInput } from './dto/update-category.input';
import { UpdateCategoryRequestDto } from './dto/update-category-request.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

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
    @Args('updateCategoryInput') updateCategoryInput: UpdateCategoryInput,
    @Context() ctx: any,
  ): Promise<UpdateCategoryResponse> {
    const userId = ctx.req.user.id;
    const updateCategoryRequestDto: UpdateCategoryRequestDto = {
      id: updateCategoryInput.id,
      userId,
    };

    const updateCategoryDto: UpdateCategoryDto = {
      ...updateCategoryInput,
    };

    return this.categoriesService.updateCategory(
      updateCategoryRequestDto,
      updateCategoryDto,
    );
  }
}
