import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from 'src/config/database.config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      formatError: (error) => {
        const graphQLFormattedError = error.extensions?.originalError as {
          message?: string;
          error?: string;
          statusCode?: number;
        };
        if (graphQLFormattedError) {
          return {
            message: graphQLFormattedError.message,
            error: graphQLFormattedError.error,
            statusCode: graphQLFormattedError.statusCode,
          };
        }
        return error;
      },
    }),
    AuthModule,
    CategoriesModule,
  ],
  providers: [],
})
export class AppModule {}
