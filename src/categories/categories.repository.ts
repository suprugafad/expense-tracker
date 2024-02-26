import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class CategoriesRepository extends Repository<Category> {
  constructor(private dataSource: DataSource) {
    super(Category, dataSource.createEntityManager());
  }

  async createCategory(
    createCategoryDto: CreateCategoryDto,
    user: User,
  ): Promise<Category> {
    const category = this.create({ ...createCategoryDto, user });

    await this.save(category);
    return category;
  }

  async findById(id: string): Promise<Category> {
    return await this.findOne({ where: { id } });
  }

  async findUserCategories(userId: string): Promise<Category[]> {
    return this.createQueryBuilder('category')
      .leftJoinAndSelect('category.user', 'user')
      .where('category.user.id = :userId OR category.user.id IS NULL', {
        userId,
      })
      .getMany();
  }

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<Category | undefined> {
    return await this.findOne({
      where: { id, user: { id: userId } },
    });
  }

  async findByNameAndUserId(
    name: string,
    userId: string,
  ): Promise<Category | undefined> {
    return await this.findOne({
      where: { name, user: { id: userId || null } },
    });
  }

  async updateCategory(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<void> {
    await this.update(id, updateCategoryDto);
  }

  async deleteById(id: string) {
    await this.delete(id);
  }
}
