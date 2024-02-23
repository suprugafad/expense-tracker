import { CategoriesService } from './categories.service';
import { Args, Resolver, Mutation, Context } from '@nestjs/graphql';
import { CreateCategoryResponse } from './dto/create-category.response';
import { CreateCategoryInput } from './dto/create-category.input';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

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
}
