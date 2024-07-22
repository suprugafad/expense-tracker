import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesResolver } from '../categories.resolver';
import { CategoriesService } from '../categories.service';
import { ExecutionContext, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { GqlExecutionContext, GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CategoriesRepository } from '../categories.repository';
import { UsersService } from 'src/auth/users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

describe.skip('CategoriesResolver', () => {
  let app: INestApplication;
  let resolver: CategoriesResolver;
  let service: CategoriesService;
  let categoriesRepository: Partial<CategoriesRepository>;
  let usersService: Partial<UsersService>;

  categoriesRepository = {
    findByNameAndUserId: jest.fn(),
    createCategory: jest.fn(),
  };

  usersService = {
    getUserById: jest.fn(),
  };

  const VALID_TOKEN = 'valid-token';

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
          req.user = { id: 'user1' };
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

    const createCategoryMutation = (input: { name?: string, description?: string }) => `
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
          query: createCategoryMutation({ description: createCategoryInput.description }),
        });

      expect(response.body.errors[0].message).toContain('Field "CreateCategoryInput.name" of required type "String!" was not provided.');
    });

    it('should return an error if user is not authorized (user without token)', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: createCategoryMutation(createCategoryInput),
        });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe('Unauthorized');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(401);
    });

    it('should create a new category without description', async () => {
      const input = { name: 'Test Category' };
      const responseMock = { id: '1', name: 'Test Category' };

      jest.spyOn(service, 'createCategory').mockResolvedValue(responseMock);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({
          query: createCategoryMutation(input),
        });
        
        expect(response.body.data.createCategory).toEqual(responseMock);
    });

    it('should create a new category', async () => {
      jest.spyOn(service, 'createCategory').mockResolvedValue(createCategoryResponse);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({
          query: createCategoryMutation(createCategoryInput),
        });
        
        expect(response.body.data.createCategory).toEqual(createCategoryResponse);
    });
  });
});
