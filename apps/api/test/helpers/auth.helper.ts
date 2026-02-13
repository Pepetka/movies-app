import type { INestApplication } from '@nestjs/common';
import type { FastifyInstance } from 'fastify';
import * as bcrypt from 'bcrypt';
import request from 'supertest';

import { UserRole } from '$common/enums';
import { users } from '$db/schemas';

type DrizzleDb = {
  insert: (table: typeof users) => {
    values: (data: object) => { returning: () => Promise<object[]> };
  };
};

export async function registerUser(
  app: INestApplication,
  drizzleDb: DrizzleDb,
  email: string,
  role: UserRole = UserRole.USER,
): Promise<{ accessToken: string; userId: number }> {
  const hashedPassword = await bcrypt.hash('SecurePass123!', 12);

  const [user] = await drizzleDb
    .insert(users)
    .values({
      name: 'Test User',
      email,
      passwordHash: hashedPassword,
      role,
    })
    .returning();

  const response = await request(
    app.getHttpServer() as FastifyInstance['server'],
  )
    .post('/auth/login')
    .send({ email, password: 'SecurePass123!' })
    .expect(200);

  return {
    accessToken: response.body.accessToken,
    userId: (user as { id: number }).id,
  };
}

export async function registerUserViaApi(
  app: INestApplication,
  email: string,
): Promise<{ accessToken: string; userId: number }> {
  const response = await request(
    app.getHttpServer() as FastifyInstance['server'],
  )
    .post('/auth/register')
    .send({ name: `User ${email}`, email, password: 'SecurePass123!' })
    .expect(201);

  const accessToken = response.body.accessToken as string;
  const payload = JSON.parse(
    Buffer.from(accessToken.split('.')[1], 'base64').toString(),
  );

  return { accessToken, userId: payload.sub };
}
