import type { INestApplication } from '@nestjs/common';
import type { FastifyInstance } from 'fastify';
import request from 'supertest';

import { GroupMemberRole } from '$common/enums';

export async function createGroup(
  app: INestApplication,
  accessToken: string,
  name: string,
): Promise<{ id: number }> {
  const response = await request(
    app.getHttpServer() as FastifyInstance['server'],
  )
    .post('/groups')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ name })
    .expect(201);

  return response.body;
}

export async function addGroupMember(
  app: INestApplication,
  accessToken: string,
  groupId: number,
  userId: number,
  role?: GroupMemberRole,
): Promise<void> {
  await request(app.getHttpServer() as FastifyInstance['server'])
    .post(`/groups/${groupId}/members`)
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ userId, role })
    .expect(201);
}

export async function updateMemberRole(
  app: INestApplication,
  accessToken: string,
  groupId: number,
  userId: number,
  role: GroupMemberRole,
): Promise<void> {
  await request(app.getHttpServer() as FastifyInstance['server'])
    .patch(`/groups/${groupId}/members/${userId}`)
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ role })
    .expect(204);
}
