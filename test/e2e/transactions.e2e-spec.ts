import { INestApplication } from '@nestjs/common';
import { loadCategoryFixtures } from '../fixtures/categories.fixture';
import { loadTransactionFixtures } from '../fixtures/transactions.fixture';
import { loadUserFixtures } from '../fixtures/users.fixture';
import { DataSource } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { clearDatabase } from '../utils/database.utils';
import {
  GET_USER_TRANSACTIONS,
  LOGIN_USER_MUTATION,
} from '../utils/graphql-queries';
import * as request from 'supertest';
import { SortOrderEnum } from 'src/transactions/sort-order.enum';
import { TransactionResponse } from 'src/transactions/dto/transaction.response';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { TransactionTypeEnum } from 'src/transactions/transaction-type.enum';

describe('Transactions (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;
  const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';
  let transactionCategoryId: string;

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
    await loadTransactionFixtures(dataSource);

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

    const transactionResponse = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: GET_USER_TRANSACTIONS,
      });

    const firstTransaction =
      transactionResponse.body.data.getUserTransactions[0];

    const transactionId = firstTransaction.id;
    transactionCategoryId = firstTransaction.category.id;
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('getUserTransactions', () => {
    it('should retrieve all users transactions', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: GET_USER_TRANSACTIONS,
        });

      expect(response.status).toBe(200);

      const transactions = response.body.data.getUserTransactions;

      expect(transactions).toBeDefined();
      expect(transactions.length).toBeGreaterThan(0);

      const transaction = transactions[0];
      expect(transaction).toHaveProperty('id');
      expect(transaction).toHaveProperty('amount');
      expect(transaction).toHaveProperty('description');
      expect(transaction).toHaveProperty('type');
      expect(transaction).toHaveProperty('date');
      expect(transaction).toHaveProperty('category');

      expect(transaction.category).toHaveProperty('id');
      expect(transaction.category).toHaveProperty('name');
    });

    it('should retrieve a limited number of transactions', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: GET_USER_TRANSACTIONS,
          variables: { limit: 2 },
        });

      const transactions = response.body.data.getUserTransactions;

      expect(transactions.length).toBeLessThanOrEqual(2);
    });

    it('should retrieve transactions filtered by date range', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: GET_USER_TRANSACTIONS,
          variables: {
            startDate: '2024-08-22T00:00:00',
            endDate: '2024-08-23T23:59:59',
            sortOrder: SortOrderEnum.NEWEST,
          },
        });

      const transactions = response.body.data.getUserTransactions;

      expect(
        transactions.every(
          (tx: TransactionResponse) =>
            new Date(tx.date) >= new Date('2024-08-22T00:00:00') &&
            new Date(tx.date) <= new Date('2024-08-23T23:59:59'),
        ),
      ).toBe(true);
    });

    it('should retrieve transactions sorted by oldest first', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: GET_USER_TRANSACTIONS,
          variables: { sortOrder: SortOrderEnum.OLDEST },
        });

      const transactions = response.body.data.getUserTransactions;

      expect(transactions.length).toBeGreaterThan(0);

      const sortedTransactions = [...transactions].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      expect(transactions).toEqual(sortedTransactions);
    });

    it('should retrieve transactions filtered by type', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: GET_USER_TRANSACTIONS,
          variables: { type: TransactionTypeEnum.INCOME },
        });

      const transactions = response.body.data.getUserTransactions;

      expect(transactions.length).toBeGreaterThan(0);

      expect(
        transactions.every(
          (tx: Transaction) => tx.type === TransactionTypeEnum.INCOME,
        ),
      ).toBe(true);
    });

    it('should skip the first few transactions', async () => {
      const firstResponse = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: GET_USER_TRANSACTIONS,
          variables: { limit: 2, skip: 0 },
        });

      const secondResponse = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: GET_USER_TRANSACTIONS,
          variables: { limit: 2, skip: 2 },
        });

      const firstTransactions = firstResponse.body.data.getUserTransactions;
      const secondTransactions = secondResponse.body.data.getUserTransactions;

      expect(firstTransactions.length).toBeLessThanOrEqual(2);
      expect(secondTransactions.length).toBeLessThanOrEqual(2);

      if (secondTransactions.length > 0) {
        expect(secondTransactions[0].id).not.toBe(firstTransactions[0].id);
      }

      const allTransactionIds = [
        ...firstTransactions,
        ...secondTransactions,
      ].map((tx) => tx.id);
      const uniqueTransactionIds = new Set(allTransactionIds);
      expect(uniqueTransactionIds.size).toBe(allTransactionIds.length);
    });

    it('should retrieve transactions filtered by category ID', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: GET_USER_TRANSACTIONS,
          variables: { categoryIds: [transactionCategoryId] },
        });

      const transactions = response.body.data.getUserTransactions;

      expect(
        transactions.every(
          (tx: Transaction) => tx.category.id === transactionCategoryId,
        ),
      ).toBe(true);

      expect(transactions.length).toBeGreaterThan(0);
    });

    it('should return an error for invalid date format', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: GET_USER_TRANSACTIONS,
          variables: { startDate: 'invalid-date' },
        });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Invalid time value');
    });

    it('should return an error for invalid date format', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: GET_USER_TRANSACTIONS,
          variables: { categoryIds: ['invalid-id'] },
        });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain(
        'invalid input syntax for type uuid: "invalid-id"',
      );
    });

    it('should return an empty array when no transactions match the filters', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: GET_USER_TRANSACTIONS,
          variables: {
            startDate: '2100-01-01T00:00:00',
            endDate: '2100-01-02T23:59:59',
          },
        });

      const transactions = response.body.data.getUserTransactions;

      expect(transactions).toBeDefined();
      expect(transactions.length).toBe(0);
    });
  });
});
