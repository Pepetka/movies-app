import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { drizzle } from 'drizzle-orm/postgres-js';
import { ConfigService } from '@nestjs/config';
import type { FastifyInstance } from 'fastify';
import csrf from '@fastify/csrf-protection';
import cookie from '@fastify/cookie';
import request from 'supertest';
import postgres from 'postgres';

import { users, groups, groupMembers } from '$db/schemas';
import { GroupMemberRole } from '$common/enums';

import { AppModule } from '../src/app.module';

describe('Invites E2E', () => {
  let app: NestFastifyApplication;
  let drizzleDb: ReturnType<typeof drizzle>;
  let sql: ReturnType<typeof postgres>;

  async function registerUser(
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

  async function createGroup(
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

  async function generateInvite(
    app: INestApplication,
    accessToken: string,
    groupId: number,
  ): Promise<{ inviteToken: string }> {
    const response = await request(
      app.getHttpServer() as FastifyInstance['server'],
    )
      .post(`/groups/${groupId}/invite`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    return response.body;
  }

  async function addGroupMember(
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

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    const configService = app.get<ConfigService>(ConfigService);
    const databaseUrl = configService.getOrThrow<string>('DATABASE_URL');

    sql = postgres(databaseUrl);
    drizzleDb = drizzle(sql, { casing: 'snake_case' });

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    const secret = configService.getOrThrow<string>('COOKIE_SECRET');

    await app.register(cookie, { secret });
    await app.register(csrf, {
      cookieOpts: {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/',
      },
    });

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app?.close();
    await sql?.end();
  });

  beforeEach(async () => {
    await drizzleDb.delete(groupMembers);
    await drizzleDb.delete(groups);
    await drizzleDb.delete(users);
  });

  describe('Generate Invite', () => {
    it('should generate invite as group admin', async () => {
      const { accessToken } = await registerUser(app, 'admin@example.com');
      const group = await createGroup(app, accessToken, 'Test Group');

      const response = await generateInvite(app, accessToken, group.id);

      expect(response.inviteToken).toBeDefined();
      expect(typeof response.inviteToken).toBe('string');
    });

    it('should generate invite as group moderator', async () => {
      const { accessToken: ownerToken } = await registerUser(
        app,
        'owner@example.com',
      );
      const group = await createGroup(app, ownerToken, 'Mod Group');

      const { accessToken: modToken, userId: modUserId } = await registerUser(
        app,
        'mod@example.com',
      );
      await addGroupMember(
        app,
        ownerToken,
        group.id,
        modUserId,
        GroupMemberRole.MODERATOR,
      );

      const response = await generateInvite(app, modToken, group.id);

      expect(response.inviteToken).toBeDefined();
    });

    it('should forbid generating invite as regular member', async () => {
      const { accessToken: ownerToken } = await registerUser(
        app,
        'owner2@example.com',
      );
      const group = await createGroup(app, ownerToken, 'Protected');

      const { accessToken: memberToken, userId: memberUserId } =
        await registerUser(app, 'member@example.com');
      await addGroupMember(app, ownerToken, group.id, memberUserId);

      await request(app.getHttpServer() as FastifyInstance['server'])
        .post(`/groups/${group.id}/invite`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(403);
    });

    it('should forbid generating invite without auth', async () => {
      const { accessToken } = await registerUser(app, 'owner3@example.com');
      const group = await createGroup(app, accessToken, 'No Auth');

      await request(app.getHttpServer() as FastifyInstance['server'])
        .post(`/groups/${group.id}/invite`)
        .expect(401);
    });
  });

  describe('Get Invite Info', () => {
    it('should return invite info without auth', async () => {
      const { accessToken } = await registerUser(app, 'info@example.com');
      const group = await createGroup(app, accessToken, 'Public Group');
      const { inviteToken } = await generateInvite(app, accessToken, group.id);

      const response = await request(app.getHttpServer())
        .get(`/invites/${inviteToken}`)
        .expect(200);

      expect(response.body).toEqual({
        id: group.id,
        name: 'Public Group',
        description: null,
        avatarUrl: null,
        memberCount: 1,
      });
    });

    it('should return 404 for invalid token', async () => {
      await request(app.getHttpServer())
        .get('/invites/doesnotexist')
        .expect(404);
    });
  });

  describe('Accept Invite', () => {
    it('should accept invite and join group as member', async () => {
      const { accessToken: ownerToken } = await registerUser(
        app,
        'accept-owner@example.com',
      );
      const group = await createGroup(app, ownerToken, 'Joinable');
      const { inviteToken } = await generateInvite(app, ownerToken, group.id);

      const { accessToken: joinerToken } = await registerUser(
        app,
        'joiner@example.com',
      );

      const response = await request(app.getHttpServer())
        .post(`/invites/${inviteToken}/accept`)
        .set('Authorization', `Bearer ${joinerToken}`)
        .expect(200);

      expect(response.body).toEqual({ groupId: group.id });

      const members = await request(app.getHttpServer())
        .get(`/groups/${group.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(members.body).toHaveLength(2);
    });

    it('should reject accept without auth', async () => {
      const { accessToken } = await registerUser(app, 'noauth@example.com');
      const group = await createGroup(app, accessToken, 'Auth Required');
      const { inviteToken } = await generateInvite(app, accessToken, group.id);

      await request(app.getHttpServer())
        .post(`/invites/${inviteToken}/accept`)
        .expect(401);
    });

    it('should return 404 for invalid token on accept', async () => {
      const { accessToken } = await registerUser(app, 'badtoken@example.com');

      await request(app.getHttpServer())
        .post('/invites/invalid/accept')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should return 409 when already a member', async () => {
      const { accessToken: ownerToken } = await registerUser(
        app,
        'already-owner@example.com',
      );
      const group = await createGroup(app, ownerToken, 'Existing');
      const { inviteToken } = await generateInvite(app, ownerToken, group.id);

      await request(app.getHttpServer())
        .post(`/invites/${inviteToken}/accept`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(409);
    });

    it('should invalidate old token on regeneration', async () => {
      const { accessToken } = await registerUser(app, 'regen@example.com');
      const group = await createGroup(app, accessToken, 'Regen Test');

      const { inviteToken: oldToken } = await generateInvite(
        app,
        accessToken,
        group.id,
      );

      const { inviteToken: newToken } = await generateInvite(
        app,
        accessToken,
        group.id,
      );

      expect(oldToken).not.toBe(newToken);

      await request(app.getHttpServer())
        .get(`/invites/${oldToken}`)
        .expect(404);

      const response = await request(app.getHttpServer())
        .get(`/invites/${newToken}`)
        .expect(200);

      expect(response.body.name).toBe('Regen Test');
    });
  });
});
