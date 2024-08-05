import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from '../categories.service';
import { CategoriesResolver } from '../categories.resolver';
import { Category } from '../entities/category.entity';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CategoriesRepository } from '../categories.repository';
import { User } from 'src/auth/entities/user.entity';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';
import { CategoriesModule } from '../categories.module';

describe('Environment variables', () => {
  it('should load JWT_REFRESH_SECRET from .env.test', () => {
    expect(process.env.JWT_REFRESH_SECRET).toBe('test-secret');
  });
});

describe('CategoriesModule', () => {
  let module: TestingModule;
  let categoriesService: CategoriesService;
  let categoriesResolver: CategoriesResolver;
  let categoriesRepository: CategoriesRepository;

  beforeEach(async () => {
    const dataSourceOptions: TypeOrmModuleOptions = {
      type: 'sqlite',
      database: ':memory:',
      entities: [Category, User, RefreshToken],
      synchronize: true,
    };

    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature([Category, User, RefreshToken]),
        TypeOrmModule.forRoot(dataSourceOptions),
        AuthModule,
        CategoriesModule,
      ],
      providers: [CategoriesService, CategoriesResolver, CategoriesRepository],
    }).compile();

    categoriesService = module.get<CategoriesService>(CategoriesService);
    categoriesResolver = module.get<CategoriesResolver>(CategoriesResolver);
    categoriesRepository =
      module.get<CategoriesRepository>(CategoriesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(categoriesService).toBeDefined();
    expect(categoriesResolver).toBeDefined();
    expect(categoriesRepository).toBeDefined();
  });

  it('should have CategoriesService as a provider', () => {
    const categoriesService = module.get<CategoriesService>(CategoriesService);
    expect(categoriesService).toBeInstanceOf(CategoriesService);
  });

  it('should have CategoriesResolver as a provider', () => {
    const categoriesResolver =
      module.get<CategoriesResolver>(CategoriesResolver);
    expect(categoriesResolver).toBeInstanceOf(CategoriesResolver);
  });

  it('should have CategoriesRepository as a provider', () => {
    const categoriesRepository =
      module.get<CategoriesRepository>(CategoriesRepository);
    expect(categoriesRepository).toBeInstanceOf(CategoriesRepository);
  });

  it('should have AuthModule as an import', () => {
    const authModule = module.get<AuthModule>(AuthModule);
    expect(authModule).toBeInstanceOf(AuthModule);
  });
});
