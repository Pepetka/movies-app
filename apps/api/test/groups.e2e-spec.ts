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
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import postgres from 'postgres';

import { users, groups, groupMembers } from '$db/schemas';
import { UserRole, GroupMemberRole } from '$common/enums';

import { AppModule } from '../src/app.module';

describe('Groups E2E', () => {
  let app: NestFastifyApplication;
  let drizzleDb: ReturnType<typeof drizzle>;
  let sql: ReturnType<typeof postgres>;

  async function registerUser(
    app: INestApplication,
    email: string,
    role: UserRole = UserRole.USER,
  ): Promise<{ accessToken: string; userId: number }> {
    if (role === UserRole.USER) {
      const response = await request(
        app.getHttpServer() as FastifyInstance['server'],
      )
        .post('/auth/register')
        .send({
          name: `User ${email}`,
          email,
          password: 'SecurePass123!',
        })
        .expect(201);

      const accessToken = response.body.accessToken as string;
      const payload = JSON.parse(
        Buffer.from(accessToken.split('.')[1], 'base64').toString(),
      );

      return {
        accessToken,
        userId: payload.sub,
      };
    }

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
      .send({
        email,
        password: 'SecurePass123!',
      })
      .expect(200);

    return {
      accessToken: response.body.accessToken,
      userId: user.id,
    };
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

  async function updateMemberRole(
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

  describe('Group Creation', () => {
    it('should create a group with minimal data', async () => {
      const { accessToken } = await registerUser(app, 'owner@example.com');

      const response = await request(app.getHttpServer())
        .post('/groups')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Test Group' })
        .expect(201);

      expect(response.body.name).toBe('Test Group');
    });

    it('should create a group with all fields', async () => {
      const { accessToken } = await registerUser(app, 'owner2@example.com');

      await request(app.getHttpServer())
        .post('/groups')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Full Group',
          description: 'A test group',
          avatarUrl: 'https://example.com/avatar.jpg',
        })
        .expect(201);
    });

    it('should reject creation without auth', async () => {
      await request(app.getHttpServer())
        .post('/groups')
        .send({ name: 'Test Group' })
        .expect(401);
    });
  });

  describe('Group Retrieval', () => {
    it('should get user groups', async () => {
      const { accessToken } = await registerUser(app, 'user1@example.com');

      await createGroup(app, accessToken, 'Group 1');
      await createGroup(app, accessToken, 'Group 2');

      const response = await request(app.getHttpServer())
        .get('/groups')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should get group by id as member', async () => {
      const { accessToken } = await registerUser(app, 'owner5@example.com');
      const group = await createGroup(app, accessToken, 'Private Group');

      const response = await request(app.getHttpServer())
        .get(`/groups/${group.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.name).toBe('Private Group');
    });

    it('should forbid getting group by non-member', async () => {
      const { accessToken: ownerToken } = await registerUser(
        app,
        'owner6@example.com',
      );
      const group = await createGroup(app, ownerToken, 'Exclusive Group');

      const { accessToken: otherToken } = await registerUser(
        app,
        'other@example.com',
      );

      await request(app.getHttpServer())
        .get(`/groups/${group.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);
    });
  });

  describe('Group Update', () => {
    it('should update group name as admin', async () => {
      const { accessToken } = await registerUser(app, 'admin1@example.com');
      const group = await createGroup(app, accessToken, 'Old Name');

      await request(app.getHttpServer())
        .patch(`/groups/${group.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'New Name' })
        .expect(200);

      const response = await request(app.getHttpServer())
        .get(`/groups/${group.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.name).toBe('New Name');
    });

    it('should update group description as moderator', async () => {
      const { accessToken: ownerToken } = await registerUser(
        app,
        'owner8@example.com',
      );
      const group = await createGroup(app, ownerToken, 'Test Group');

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

      const response = await request(app.getHttpServer())
        .patch(`/groups/${group.id}`)
        .set('Authorization', `Bearer ${modToken}`)
        .send({ description: 'Updated description' })
        .expect(200);

      expect(response.body.description).toBe('Updated description');
    });

    it('should forbid update by regular member', async () => {
      const { accessToken: ownerToken } = await registerUser(
        app,
        'owner9@example.com',
      );
      const group = await createGroup(app, ownerToken, 'Protected Group');

      const { accessToken: memberToken, userId: memberUserId } =
        await registerUser(app, 'member1@example.com');
      await addGroupMember(app, ownerToken, group.id, memberUserId);

      await request(app.getHttpServer())
        .patch(`/groups/${group.id}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ name: 'Hacked Name' })
        .expect(403);
    });
  });

  describe('Group Deletion', () => {
    it('should delete group as admin', async () => {
      const { accessToken } = await registerUser(app, 'admin2@example.com');
      const group = await createGroup(app, accessToken, 'To Delete');

      await request(app.getHttpServer())
        .delete(`/groups/${group.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/groups/${group.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });

    it('should forbid deletion by moderator', async () => {
      const { accessToken: ownerToken } = await registerUser(
        app,
        'owner11@example.com',
      );
      const group = await createGroup(app, ownerToken, 'Protected');

      const { accessToken: modToken, userId: modUserId } = await registerUser(
        app,
        'mod2@example.com',
      );
      await addGroupMember(
        app,
        ownerToken,
        group.id,
        modUserId,
        GroupMemberRole.MODERATOR,
      );

      await request(app.getHttpServer())
        .delete(`/groups/${group.id}`)
        .set('Authorization', `Bearer ${modToken}`)
        .expect(403);
    });
  });

  describe('Group Members', () => {
    it('should get group members as member', async () => {
      const { accessToken: ownerToken } = await registerUser(
        app,
        'owner13@example.com',
      );
      const group = await createGroup(app, ownerToken, 'Member Test');

      const { accessToken: memberToken, userId } = await registerUser(
        app,
        'member3@example.com',
      );
      await addGroupMember(app, ownerToken, group.id, userId);

      const response = await request(app.getHttpServer())
        .get(`/groups/${group.id}/members`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should get own member info', async () => {
      const { accessToken: ownerToken } = await registerUser(
        app,
        'owner15@example.com',
      );
      const group = await createGroup(app, ownerToken, 'Me Test');

      const response = await request(app.getHttpServer())
        .get(`/groups/${group.id}/members/me`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(response.body.role).toBe(GroupMemberRole.ADMIN);
    });

    it('should add member as moderator', async () => {
      const { accessToken: ownerToken } = await registerUser(
        app,
        'owner16@example.com',
      );
      const group = await createGroup(app, ownerToken, 'Add Test');

      const { userId } = await registerUser(app, 'newmember@example.com');

      await request(app.getHttpServer())
        .post(`/groups/${group.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId })
        .expect(201);

      const members = await request(app.getHttpServer())
        .get(`/groups/${group.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(members.body).toHaveLength(2);
    });

    it('should forbid adding member as regular member', async () => {
      const { accessToken: ownerToken, userId: ownerId } = await registerUser(
        app,
        'owner17@example.com',
      );
      const group = await createGroup(app, ownerToken, 'No Add');

      const { accessToken: memberToken, userId } = await registerUser(
        app,
        'member4@example.com',
      );
      await addGroupMember(app, ownerToken, group.id, userId);

      await request(app.getHttpServer())
        .post(`/groups/${group.id}/members`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ userId: ownerId })
        .expect(403);
    });

    it('should reject adding existing member', async () => {
      const { accessToken: ownerToken } = await registerUser(
        app,
        'owner18@example.com',
      );
      const group = await createGroup(app, ownerToken, 'Duplicate Test');

      const { userId: memberUserId } = await registerUser(
        app,
        'member5@example.com',
      );
      await addGroupMember(app, ownerToken, group.id, memberUserId);

      await request(app.getHttpServer())
        .post(`/groups/${group.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: memberUserId })
        .expect(409);
    });

    it('should leave group as member', async () => {
      const { accessToken: ownerToken } = await registerUser(
        app,
        'owner19@example.com',
      );
      const group = await createGroup(app, ownerToken, 'Leave Test');

      const { accessToken: memberToken, userId: memberUserId } =
        await registerUser(app, 'leaver@example.com');
      await addGroupMember(app, ownerToken, group.id, memberUserId);

      await request(app.getHttpServer())
        .delete(`/groups/${group.id}/members/me`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(204);
    });

    it('should forbid leaving when last admin', async () => {
      const { accessToken } = await registerUser(app, 'owner20@example.com');
      const group = await createGroup(app, accessToken, 'Only Admin');

      await request(app.getHttpServer())
        .delete(`/groups/${group.id}/members/me`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(409);
    });

    it('should remove member as moderator', async () => {
      const { accessToken: ownerToken } = await registerUser(
        app,
        'owner21@example.com',
      );
      const group = await createGroup(app, ownerToken, 'Remove Test');

      const { userId: memberUserId } = await registerUser(
        app,
        'removee@example.com',
      );
      await addGroupMember(app, ownerToken, group.id, memberUserId);

      await request(app.getHttpServer())
        .delete(`/groups/${group.id}/members/${memberUserId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(204);
    });

    it('should forbid removing admin as moderator', async () => {
      const { accessToken: ownerToken, userId: ownerId } = await registerUser(
        app,
        'owner22@example.com',
      );
      const group = await createGroup(app, ownerToken, 'Protected Admin');

      const { accessToken: modToken, userId: modUserId } = await registerUser(
        app,
        'mod3@example.com',
      );
      await addGroupMember(
        app,
        ownerToken,
        group.id,
        modUserId,
        GroupMemberRole.MODERATOR,
      );

      await request(app.getHttpServer())
        .delete(`/groups/${group.id}/members/${ownerId}`)
        .set('Authorization', `Bearer ${modToken}`)
        .expect(403);
    });

    it('should forbid removing moderator by member', async () => {
      const { accessToken: ownerToken } = await registerUser(
        app,
        'owner23@example.com',
      );
      const group = await createGroup(app, ownerToken, 'Protected Mod');

      const { userId: modUserId } = await registerUser(app, 'mod4@example.com');
      await addGroupMember(
        app,
        ownerToken,
        group.id,
        modUserId,
        GroupMemberRole.MODERATOR,
      );

      const { accessToken: memberToken, userId: memberUserId } =
        await registerUser(app, 'member6@example.com');
      await addGroupMember(app, ownerToken, group.id, memberUserId);

      await request(app.getHttpServer())
        .delete(`/groups/${group.id}/members/${modUserId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(403);
    });
  });

  describe('Member Role Updates', () => {
    it('should update member role as admin', async () => {
      const { accessToken: ownerToken } = await registerUser(
        app,
        'owner24@example.com',
      );
      const group = await createGroup(app, ownerToken, 'Role Test');

      const { userId: memberUserId } = await registerUser(
        app,
        'promote@example.com',
      );
      await addGroupMember(app, ownerToken, group.id, memberUserId);

      await updateMemberRole(
        app,
        ownerToken,
        group.id,
        memberUserId,
        GroupMemberRole.MODERATOR,
      );

      const members = await request(app.getHttpServer())
        .get(`/groups/${group.id}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      const member = members.body.find((m: any) => m.userId === memberUserId);
      expect(member.role).toBe(GroupMemberRole.MODERATOR);
    });

    it('should forbid role update by moderator', async () => {
      const { accessToken: ownerToken } = await registerUser(
        app,
        'owner25@example.com',
      );
      const group = await createGroup(app, ownerToken, 'Admin Only');

      const { accessToken: modToken, userId: modUserId } = await registerUser(
        app,
        'mod5@example.com',
      );
      await addGroupMember(
        app,
        ownerToken,
        group.id,
        modUserId,
        GroupMemberRole.MODERATOR,
      );

      const { userId: memberUserId } = await registerUser(
        app,
        'member7@example.com',
      );
      await addGroupMember(app, ownerToken, group.id, memberUserId);

      await request(app.getHttpServer())
        .patch(`/groups/${group.id}/members/${memberUserId}`)
        .set('Authorization', `Bearer ${modToken}`)
        .send({ role: GroupMemberRole.MODERATOR })
        .expect(403);
    });
  });

  describe('Ownership Transfer', () => {
    it('should transfer ownership as admin', async () => {
      const { accessToken: ownerToken, userId: ownerId } = await registerUser(
        app,
        'owner26@example.com',
      );
      const group = await createGroup(app, ownerToken, 'Transfer Test');

      const { accessToken: newOwnerToken, userId: newOwnerId } =
        await registerUser(app, 'newowner@example.com');
      await addGroupMember(app, ownerToken, group.id, newOwnerId);

      await request(app.getHttpServer())
        .post(`/groups/${group.id}/transfer-ownership`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ targetUserId: newOwnerId })
        .expect(204);

      const members = await request(app.getHttpServer())
        .get(`/groups/${group.id}/members`)
        .set('Authorization', `Bearer ${newOwnerToken}`)
        .expect(200);

      const oldOwner = members.body.find((m: any) => m.userId === ownerId);
      const newOwner = members.body.find((m: any) => m.userId === newOwnerId);

      expect(oldOwner.role).toBe(GroupMemberRole.MODERATOR);
      expect(newOwner.role).toBe(GroupMemberRole.ADMIN);
    });

    it('should forbid transfer to self', async () => {
      const { accessToken, userId } = await registerUser(
        app,
        'owner27@example.com',
      );
      const group = await createGroup(app, accessToken, 'Self Test');

      await request(app.getHttpServer())
        .post(`/groups/${group.id}/transfer-ownership`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ targetUserId: userId })
        .expect(400);
    });

    it('should forbid transfer to non-member', async () => {
      const { accessToken: ownerToken } = await registerUser(
        app,
        'owner28@example.com',
      );
      const group = await createGroup(app, ownerToken, 'Target Test');

      const { userId: strangerId } = await registerUser(
        app,
        'stranger3@example.com',
      );

      await request(app.getHttpServer())
        .post(`/groups/${group.id}/transfer-ownership`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ targetUserId: strangerId })
        .expect(400);
    });

    it('should forbid transfer by moderator', async () => {
      const { accessToken: ownerToken } = await registerUser(
        app,
        'owner29@example.com',
      );
      const group = await createGroup(app, ownerToken, 'Mod Transfer');

      const { accessToken: modToken, userId: modUserId } = await registerUser(
        app,
        'mod6@example.com',
      );
      await addGroupMember(
        app,
        ownerToken,
        group.id,
        modUserId,
        GroupMemberRole.MODERATOR,
      );

      const { userId: ownerId } = await registerUser(app, 'admin@example.com');

      await request(app.getHttpServer())
        .post(`/groups/${group.id}/transfer-ownership`)
        .set('Authorization', `Bearer ${modToken}`)
        .send({ targetUserId: ownerId })
        .expect(403);
    });
  });

  describe('Admin Endpoints', () => {
    it('should get all groups as admin', async () => {
      const { accessToken: adminToken } = await registerUser(
        app,
        'admin3@example.com',
        UserRole.ADMIN,
      );

      const { accessToken: userToken } = await registerUser(
        app,
        'user1@example.com',
      );
      await createGroup(app, userToken, 'User Group');

      const response = await request(app.getHttpServer())
        .get('/groups/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get user groups as admin', async () => {
      const { accessToken: adminToken } = await registerUser(
        app,
        'admin4@example.com',
        UserRole.ADMIN,
      );

      const { userId: targetUserId, accessToken: targetToken } =
        await registerUser(app, 'target@example.com');
      await createGroup(app, targetToken, 'Target Group');

      const response = await request(app.getHttpServer())
        .get(`/groups/user/${targetUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
