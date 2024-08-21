import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesResolver } from '../categories.resolver';
import { CategoriesService } from '../categories.service';
import {
  ExecutionContext,
  NotFoundException,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { GqlExecutionContext, GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CategoriesRepository } from '../categories.repository';
import { UsersService } from 'src/auth/users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Category } from '../entities/category.entity';

describe('CategoriesResolver', () => {
  let app: INestApplication;
  let resolver: CategoriesResolver;
  let service: CategoriesService;

  const categoriesRepository: Partial<CategoriesRepository> = {
    findByNameAndUserId: jest.fn(),
    createCategory: jest.fn(),
  };

  const usersService: Partial<UsersService> = {
    getUserById: jest.fn(),
  };

  const VALID_TOKEN = 'valid-token';
  const userId = 'user1';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true,
          context: ({ req }) => ({ req }),
        }),
      ],
      providers: [
        CategoriesResolver,
        CategoriesService,
        {
          provide: CategoriesRepository,
          useValue: categoriesRepository,
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn((context: ExecutionContext) => {
          const ctx = GqlExecutionContext.create(context).getContext();
          const req = ctx.req;
          const authHeader = req.headers.authorization;

          if (!authHeader) {
            throw new UnauthorizedException();
          }

          const token = authHeader.split(' ')[1];

          if (token === VALID_TOKEN) {
            req.user = { id: userId };
            return true;
          }

          throw new UnauthorizedException();
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    resolver = moduleFixture.get<CategoriesResolver>(CategoriesResolver);
    service = moduleFixture.get<CategoriesService>(CategoriesService);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCategory', () => {
    const createCategoryInput = {
      name: 'Test Category',
      description: 'Description of the Category',
    };

    const createCategoryResponse = {
      id: '1',
      name: 'Test Category',
      description: 'Description of the Category',
    };

    const createCategoryMutation = (input: {
      name?: string;
      description?: string;
    }) => `
      mutation {
        createCategory(createCategoryInput: { 
          ${input.name ? `name: "${input.name}",` : ''}
          ${input.description ? `description: "${input.description}"` : ''}
        }) {
          id
          name
          description
        }
      }
    `;

    it('should return an error if name is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({
          query: createCategoryMutation({
            description: createCategoryInput.description,
          }),
        });

      expect(response.body.errors[0].message).toContain(
        'Field "CreateCategoryInput.name" of required type "String!" was not provided.',
      );
    });

    it('should return an error if user is not authorized (user without token)', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: createCategoryMutation(createCategoryInput),
        });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe('Unauthorized');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(
        401,
      );
    });

    it('should create a new category without description', async () => {
      const input = { name: 'Test Category' };
      const responseMock = {
        id: '1',
        name: 'Test Category',
        description: null,
      };

      const createCategorySpyOn = jest
        .spyOn(service, 'createCategory')
        .mockResolvedValue(responseMock);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({
          query: createCategoryMutation(input),
        });

      expect(createCategorySpyOn).toHaveBeenCalledWith({ ...input, userId });
      expect(response.body.data.createCategory).toEqual(responseMock);
    });

    it('should create a new category', async () => {
      const createCategorySpyOn = jest
        .spyOn(service, 'createCategory')
        .mockResolvedValue(createCategoryResponse);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({
          query: createCategoryMutation(createCategoryInput),
        });

      expect(createCategorySpyOn).toHaveBeenCalledWith({
        ...createCategoryInput,
        userId,
      });
      expect(response.body.data.createCategory).toEqual(createCategoryResponse);
    });
  });

  describe('updateCategory', () => {
    const categoryId = '1';
    const updateCategoryInput = {
      name: 'Updated Category',
      description: 'Updated Description of the Category',
    };

    const updateCategoryResponse = {
      id: '1',
      name: 'Updated Category',
      description: 'Updated Description of the Category',
    };

    const updateCategoryMutation = (
      id: string,
      input: {
        name?: string;
        description?: string;
      },
    ) => `
      mutation {
        updateCategory(
          id: ${id}, 
          updateCategoryInput: { 
          ${input.name ? `name: "${input.name}",` : ''}
          ${input.description ? `description: "${input.description}"` : ''}
          }) {
            id
            name
            description
        }
      }
    `;

    it('should update the category', async () => {
      const updateCategorySpyOn = jest
        .spyOn(service, 'updateCategory')
        .mockResolvedValue(updateCategoryResponse);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({
          query: updateCategoryMutation(categoryId, updateCategoryInput),
        });

      expect(response.body.data.updateCategory).toEqual(updateCategoryResponse);
      expect(updateCategorySpyOn).toHaveBeenCalledWith(
        { id: categoryId, userId },
        updateCategoryInput,
      );
    });

    it('should update the category without description', async () => {
      updateCategoryInput.description = undefined;
      updateCategoryResponse.description = 'Old Description';

      const updateCategorySpyOn = jest
        .spyOn(service, 'updateCategory')
        .mockResolvedValue(updateCategoryResponse);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({
          query: updateCategoryMutation(categoryId, updateCategoryInput),
        });

      expect(response.body.data.updateCategory).toEqual(updateCategoryResponse);
      expect(updateCategorySpyOn).toHaveBeenCalledWith(
        { id: categoryId, userId },
        updateCategoryInput,
      );
    });

    it('should update the category without name', async () => {
      updateCategoryInput.name = undefined;
      updateCategoryResponse.name = 'Old Name';

      const updateCategorySpyOn = jest
        .spyOn(service, 'updateCategory')
        .mockResolvedValue(updateCategoryResponse);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({
          query: updateCategoryMutation(categoryId, updateCategoryInput),
        });

      expect(response.body.data.updateCategory).toEqual(updateCategoryResponse);
      expect(updateCategorySpyOn).toHaveBeenCalledWith(
        { id: categoryId, userId },
        updateCategoryInput,
      );
    });

    it('should return an error if user is not authorized (user without token)', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: updateCategoryMutation(categoryId, updateCategoryInput),
        });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe('Unauthorized');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(
        401,
      );
    });

    it('should update the category without name and description', async () => {
      const updateCategoryInput = {};
      const updateCategoryResponse = {
        id: '1',
        name: 'Old Name',
        description: 'Old Description',
      };

      const updateCategorySpyOn = jest
        .spyOn(service, 'updateCategory')
        .mockResolvedValue(updateCategoryResponse);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({
          query: updateCategoryMutation(categoryId, updateCategoryInput),
        });

      expect(response.body.data.updateCategory).toEqual(updateCategoryResponse);
      expect(updateCategorySpyOn).toHaveBeenCalledWith(
        { id: categoryId, userId },
        updateCategoryInput,
      );
    });

    it('should return error for invalid id format', async () => {
      const invalidId = undefined;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({
          query: updateCategoryMutation(invalidId, updateCategoryInput),
        });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain(
        'ID cannot represent a non-string and non-integer value: undefined',
      );
    });

    it('should return error if category does not exist', async () => {
      const updateCategorySpyOn = jest
        .spyOn(service, 'updateCategory')
        .mockRejectedValue(
          new NotFoundException(
            `Custom category with id "${categoryId}" not exist.`,
          ),
        );

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({
          query: updateCategoryMutation(categoryId, updateCategoryInput),
        });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        `Custom category with id "${categoryId}" not exist.`,
      );
      expect(updateCategorySpyOn).toHaveBeenCalledWith(
        { id: categoryId, userId },
        updateCategoryInput,
      );
    });
  });

  describe('getUserCategories', () => {
    const getUserCategoriesQuery = `
      query {
        getUserCategories {
          id
          name
          description
        }
      }
    `;

    it('should return user categories', async () => {
      const userCategories: Category[] = [
        { id: '1', name: 'Category 1', description: 'Description 1' },
        { id: '2', name: 'Category 2', description: 'Description 2' },
      ];

      const getUserCategoriesSpyOn = jest
        .spyOn(service, 'getUserCategories')
        .mockResolvedValue(userCategories);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({ query: getUserCategoriesQuery });

      expect(getUserCategoriesSpyOn).toHaveBeenCalledWith(userId);
      expect(response.body.data.getUserCategories).toEqual(userCategories);
    });

    it('should return an empty array if user has no categories', async () => {
      const getUserCategoriesSpyOn = jest
        .spyOn(service, 'getUserCategories')
        .mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({ query: getUserCategoriesQuery });

      expect(getUserCategoriesSpyOn).toHaveBeenCalledWith(userId);
      expect(response.body.data.getUserCategories).toEqual([]);
    });

    it('should return an error if user is not authorized', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: getUserCategoriesQuery });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe('Unauthorized');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(
        401,
      );
    });
  });

  describe('deleteCategory', () => {
    const categoryId = '1';

    const deleteCategoryMutation = (id: string) => `
      mutation {
        deleteCategory(id: "${id}") {
          success
        }
      }
    `;

    it('should delete the category', async () => {
      const deleteCategorySpyOn = jest
        .spyOn(service, 'deleteCategory')
        .mockResolvedValue();

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({ query: deleteCategoryMutation(categoryId) });

      expect(deleteCategorySpyOn).toHaveBeenCalledWith(categoryId, userId);
      expect(response.body.data.deleteCategory.success).toBe(true);
    });

    it('should return an error if user is not authorized', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: deleteCategoryMutation(categoryId) });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe('Unauthorized');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(
        401,
      );
    });

    it('should return an error if category does not exist', async () => {
      const deleteCategorySpyOn = jest
        .spyOn(service, 'deleteCategory')
        .mockRejectedValue(
          new NotFoundException(
            `Custom category with id "${categoryId}" not exist.`,
          ),
        );

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({ query: deleteCategoryMutation(categoryId) });

      expect(deleteCategorySpyOn).toHaveBeenCalledWith(categoryId, userId);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        `Custom category with id "${categoryId}" not exist.`,
      );
    });
  });
});
