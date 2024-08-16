import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { loadCategoryFixtures } from '../fixtures/categories.fixture';
import { loadUserFixtures } from '../fixtures/users.fixture';
import { clearDatabase } from '../utils/database.utils';
import { Category } from 'src/categories/entities/category.entity';

describe('Categories (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;

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

    const loginResponse = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
        mutation {
          loginUser(loginUserInput: { email: "test@gmail.com", password: "password" }) {
            access_token
          }
        }
      `,
      });

    authToken = loginResponse.body.data.loginUser.access_token;
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  it('should retrieve all categories for a user, including general and user categories', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          query {
            getUserCategories {
              id
              name
              description
              user {
                id
                email
              }
            }
          }
        `,
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
});
