import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export async function testUnauthorizedAccess(
  app: INestApplication,
  query: string,
  variables?: any,
) {
  const response = await request(app.getHttpServer())
    .post('/graphql')
    .send({
      query,
      variables,
    });

  expect(response.body.errors).toBeDefined();
  expect(response.body.errors[0].message).toBe('Unauthorized');
  expect(response.body.errors[0].statusCode).toBe(401);
}

export async function testInvalidTokenAccess(
  app: INestApplication,
  query: string,
  variables?: any,
) {
  const response = await request(app.getHttpServer())
    .post('/graphql')
    .set('Authorization', 'Bearer invalid-token')
    .send({
      query,
      variables,
    });

  expect(response.body.errors).toBeDefined();
  expect(response.body.errors[0].message).toBe('Unauthorized');
  expect(response.body.errors[0].statusCode).toBe(401);
}
