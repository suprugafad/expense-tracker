import { UsersRepository } from './../auth/users.repository';
import { DataSource, Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesRepository extends Repository<Category> {
  constructor(
    private dataSource: DataSource,
    private usersRepository: UsersRepository,
  ) {
    super(Category, dataSource.createEntityManager());
  }

  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const userId = createCategoryDto.userId;

    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(` User with id ${userId} not found`);
    }

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

  async updateCategory(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<void> {
    await this.update(id, updateCategoryDto);
  }

  async findByNameAndUserId(
    name: string,
    userId: string,
  ): Promise<Category | undefined> {
    return await this.findOne({
      where: { name, user: { id: userId || null } },
    });
  }
}
