import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { FastifyInstance } from 'fastify';
import request from 'supertest';

import { AppModule } from '../src/app.module';

describe('Health E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('Health', () => {
    it('should return health status', async () => {
      await request(app.getHttpServer() as FastifyInstance['server'])
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('database', 'connected');
        });
    });
  });
});
