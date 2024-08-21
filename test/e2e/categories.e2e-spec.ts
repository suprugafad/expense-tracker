import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { loadCategoryFixtures } from '../fixtures/categories.fixture';
import { loadUserFixtures } from '../fixtures/users.fixture';
import { clearDatabase } from '../utils/database.utils';
import { Category } from 'src/categories/entities/category.entity';
import {
  testInvalidTokenAccess,
  testUnauthorizedAccess,
} from '../utils/test-helpers.utils';
import {
  CREATE_CATEGORY_MUTATION,
  DELETE_CATEGORY_MUTATION,
  GET_USER_CATEGORIES,
  LOGIN_USER_MUTATION,
  UPDATE_CATEGORY_MUTATION,
} from '../utils/graphql-queries';

describe('Categories (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;
  let categoryId: string;
  const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);

    await clearDatabase(dataSource);

    await loadUserFixtures(dataSource);
    await loadCategoryFixtures(dataSource);

    const loginUserInput = {
      email: 'test@gmail.com',
      password: 'password',
    };

    const loginResponse = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: LOGIN_USER_MUTATION,
        variables: loginUserInput,
      });

    authToken = loginResponse.body.data.loginUser.access_token;

    const categoryResponse = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: GET_USER_CATEGORIES,
      });

    const categories = categoryResponse.body.data.getUserCategories;
    const customCategory = categories.find(
      (cat: Category) => cat.user !== null,
    );
    categoryId = customCategory.id;
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('getUserCategories', () => {
    it('should retrieve all categories for a user, including general and user categories', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: GET_USER_CATEGORIES,
        });

      const categories = response.body.data.getUserCategories;

      expect(categories.length).toBeGreaterThan(0);

      const generalCategory = categories.find((cat: Category) => !cat.user);
      expect(generalCategory).toBeDefined();
      expect(generalCategory.name).toContain('General Category');

      const userCategory = categories.find(
        (cat: Category) => cat.user && cat.user.email === 'test@gmail.com',
      );
      expect(userCategory).toBeDefined();
      expect(userCategory.name).toContain('User Category');
      expect(userCategory.user).toHaveProperty('email');
    });

    it('should return an error if user is not authorized', async () => {
      await testUnauthorizedAccess(app, GET_USER_CATEGORIES);
    });

    it('should return an error if token is invalid', async () => {
      await testInvalidTokenAccess(app, GET_USER_CATEGORIES);
    });
  });

  describe('createCategory', () => {
    const createCategoryInput = {
      name: 'New Category',
      description: 'This is a new category',
    };

    it('should successfully create a new category', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: CREATE_CATEGORY_MUTATION,
          variables: createCategoryInput,
        });

      const category = response.body.data.createCategory;

      expect(category).toBeDefined();
      expect(category.id).toBeDefined();
      expect(category.name).toBe(createCategoryInput.name);
      expect(category.description).toBe(createCategoryInput.description);

      const categoryInDB = await dataSource
        .getRepository(Category)
        .findOne({ where: { id: category.id } });

      expect(categoryInDB).toBeDefined();
      expect(categoryInDB.name).toBe(createCategoryInput.name);
      expect(categoryInDB.description).toBe(createCategoryInput.description);
    });

    it('should return an error if name is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: CREATE_CATEGORY_MUTATION,
          variables: {
            description: createCategoryInput.description,
          },
        });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain(
        'Variable "$name" of required type "String!" was not provided.',
      );
    });

    it('should return an error if category with this name is already exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: CREATE_CATEGORY_MUTATION,
          variables: {
            name: createCategoryInput.name,
          },
        });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain(
        `Category with name "${createCategoryInput.name}" already exist.`,
      );
    });

    it('should return an error if general category with this name is already exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: CREATE_CATEGORY_MUTATION,
          variables: {
            name: 'General Category 1',
          },
        });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain(
        `Category with name "General Category 1" already exist.`,
      );
    });

    it('should return an error if user is not authorized', async () => {
      await testUnauthorizedAccess(
        app,
        CREATE_CATEGORY_MUTATION,
        createCategoryInput,
      );
    });

    it('should return an error if token is invalid', async () => {
      await testInvalidTokenAccess(
        app,
        CREATE_CATEGORY_MUTATION,
        createCategoryInput,
      );
    });
  });

  describe('updateCategory', () => {
    const updateCategoryInput = {
      name: 'Updated Category',
      description: 'Updated Description of the Category',
    };

    it('should update the category', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: UPDATE_CATEGORY_MUTATION,
          variables: { id: categoryId, ...updateCategoryInput },
        });

      const updatedCategory = response.body.data.updateCategory;

      expect(updatedCategory).toBeDefined();
      expect(updatedCategory.name).toBe(updateCategoryInput.name);
      expect(updatedCategory.description).toBe(updateCategoryInput.description);
    });

    it('should return an error if user is not authorized', async () => {
      await testUnauthorizedAccess(app, UPDATE_CATEGORY_MUTATION, {
        id: categoryId,
        ...updateCategoryInput,
      });
    });

    it('should return an error if token is invalid', async () => {
      await testInvalidTokenAccess(app, UPDATE_CATEGORY_MUTATION, {
        id: categoryId,
        ...updateCategoryInput,
      });
    });

    it('should return error if category does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: UPDATE_CATEGORY_MUTATION,
          variables: { id: nonExistentId, ...updateCategoryInput },
        });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain(
        `Custom category with id "${nonExistentId}" not exist.`,
      );
    });

    it('should return error for invalid id format', async () => {
      const invalidId = 'invalid-id';

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: UPDATE_CATEGORY_MUTATION,
          variables: { id: invalidId, ...updateCategoryInput },
        });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain(
        `invalid input syntax for type uuid: "${invalidId}"`,
      );
    });
  });

  describe('deleteCategory', () => {
    it('should delete the category', async () => {
      const responseBefore = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: GET_USER_CATEGORIES,
        });

      const categoriesBefore = responseBefore.body.data.getUserCategories;
      const categoriesCountBefore = categoriesBefore.length;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: DELETE_CATEGORY_MUTATION,
          variables: { id: categoryId },
        });

      const deletedCategoryResult = response.body.data.deleteCategory;

      expect(deletedCategoryResult).toBeDefined();
      expect(deletedCategoryResult.success).toBe(true);

      const responseAfter = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: GET_USER_CATEGORIES,
        });

      const categoriesAfter = responseAfter.body.data.getUserCategories;
      const categoriesCountAfter = categoriesAfter.length;

      expect(categoriesCountAfter).toBe(categoriesCountBefore - 1);

      const categoryInDB = await dataSource
        .getRepository(Category)
        .findOne({ where: { id: categoryId } });

      expect(categoryInDB).toBeNull();
    });

    it('should return an error if user is not authorized', async () => {
      await testUnauthorizedAccess(app, DELETE_CATEGORY_MUTATION, {
        id: categoryId,
      });
    });

    it('should return an error if token is invalid', async () => {
      await testInvalidTokenAccess(app, DELETE_CATEGORY_MUTATION, {
        id: categoryId,
      });
    });

    it('should return error if category does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: DELETE_CATEGORY_MUTATION,
          variables: { id: nonExistentId },
        });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain(
        `Custom category with id "${nonExistentId}" not exist.`,
      );
    });
  });
});
