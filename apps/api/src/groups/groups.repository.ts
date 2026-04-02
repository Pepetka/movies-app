import { Inject, Injectable } from '@nestjs/common';
import { eq, and, count } from 'drizzle-orm';

import {
  users,
  groups,
  groupMembers,
  type Group,
  type NewGroup,
  type GroupMember,
  type NewGroupMember,
} from '$db/schemas';
import { DrizzleDb } from '$db/types/drizzle.types';
import { GroupMemberRole } from '$common/enums';

export type GroupMemberWithUser = {
  id: number;
  groupId: number;
  userId: number;
  role: GroupMember['role'];
  createdAt: Date;
  updatedAt: Date;
  user: { id: number; name: string };
};
import { DRIZZLE } from '$db/db.module';

@Injectable()
export class GroupsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async createGroup(data: NewGroup): Promise<Group> {
    const [result] = await this.db.insert(groups).values(data).returning();
    return result;
  }

  async createGroupWithAdmin(
    groupData: NewGroup,
    adminData: { userId: number; role: GroupMemberRole },
  ): Promise<Group> {
    const [group] = await this.db.transaction(async (tx) => {
      const [newGroup] = await tx.insert(groups).values(groupData).returning();

      await tx.insert(groupMembers).values({
        groupId: newGroup.id,
        userId: adminData.userId,
        role: adminData.role,
      });

      return [newGroup] as const;
    });
    return group;
  }

  async findGroupById(id: number): Promise<Group | null> {
    const [result] = await this.db
      .select()
      .from(groups)
      .where(eq(groups.id, id))
      .limit(1);
    return result ?? null;
  }

  async findAllGroups(): Promise<Group[]> {
    return this.db.select().from(groups).orderBy(groups.createdAt);
  }

  async findGroupsByUserId(userId: number) {
    return this.db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        avatarUrl: groups.avatarUrl,
        createdAt: groups.createdAt,
        updatedAt: groups.updatedAt,
      })
      .from(groups)
      .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
      .where(eq(groupMembers.userId, userId))
      .orderBy(groupMembers.createdAt);
  }

  async updateGroup(id: number, data: Partial<NewGroup>): Promise<Group> {
    const [result] = await this.db
      .update(groups)
      .set({ ...data })
      .where(eq(groups.id, id))
      .returning();
    return result;
  }

  async deleteGroup(id: number): Promise<void> {
    await this.db.delete(groups).where(eq(groups.id, id));
  }

  async addMemberIfNotExists(
    data: NewGroupMember,
  ): Promise<GroupMember | null> {
    const [result] = await this.db
      .insert(groupMembers)
      .values(data)
      .onConflictDoNothing({
        target: [groupMembers.groupId, groupMembers.userId],
      })
      .returning();
    return result ?? null;
  }

  async findMember(
    groupId: number,
    userId: number,
  ): Promise<GroupMember | null> {
    const [result] = await this.db
      .select()
      .from(groupMembers)
      .where(
        and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)),
      )
      .limit(1);
    return result ?? null;
  }

  async findMembersByGroup(groupId: number): Promise<GroupMember[]> {
    return this.db
      .select()
      .from(groupMembers)
      .where(eq(groupMembers.groupId, groupId))
      .orderBy(groupMembers.createdAt);
  }

  async findMembersByGroupWithUsers(
    groupId: number,
  ): Promise<GroupMemberWithUser[]> {
    return this.db
      .select({
        id: groupMembers.id,
        groupId: groupMembers.groupId,
        userId: groupMembers.userId,
        role: groupMembers.role,
        createdAt: groupMembers.createdAt,
        updatedAt: groupMembers.updatedAt,
        user: {
          id: users.id,
          name: users.name,
        },
      })
      .from(groupMembers)
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(eq(groupMembers.groupId, groupId))
      .orderBy(groupMembers.createdAt);
  }

  async findMemberWithUser(
    groupId: number,
    userId: number,
  ): Promise<GroupMemberWithUser | null> {
    const [result] = await this.db
      .select({
        id: groupMembers.id,
        groupId: groupMembers.groupId,
        userId: groupMembers.userId,
        role: groupMembers.role,
        createdAt: groupMembers.createdAt,
        updatedAt: groupMembers.updatedAt,
        user: {
          id: users.id,
          name: users.name,
        },
      })
      .from(groupMembers)
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(
        and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)),
      )
      .limit(1);

    return result ?? null;
  }

  async updateMemberRole(
    groupId: number,
    userId: number,
    role: GroupMemberRole,
  ): Promise<GroupMember> {
    const [result] = await this.db
      .update(groupMembers)
      .set({ role })
      .where(
        and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)),
      )
      .returning();
    return result;
  }

  async removeMember(groupId: number, userId: number): Promise<void> {
    await this.db
      .delete(groupMembers)
      .where(
        and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)),
      );
  }

  async countAdmins(groupId: number): Promise<number> {
    const [result] = await this.db
      .select({ count: count() })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.role, GroupMemberRole.ADMIN),
        ),
      );
    return result.count;
  }

  async transferOwnership(
    groupId: number,
    currentAdminId: number,
    targetUserId: number,
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx
        .update(groupMembers)
        .set({ role: GroupMemberRole.MODERATOR })
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, currentAdminId),
          ),
        );

      await tx
        .update(groupMembers)
        .set({ role: GroupMemberRole.ADMIN })
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, targetUserId),
          ),
        );
    });
  }

  async addMemberToGroupByInvite(
    token: string,
    userId: number,
    role: GroupMemberRole,
  ): Promise<
    | { ok: true; group: Group }
    | { ok: false; reason: 'invalid_token' | 'already_member' }
  > {
    return this.db.transaction(async (tx) => {
      const [group] = await tx
        .select()
        .from(groups)
        .where(eq(groups.inviteToken, token))
        .limit(1);

      if (!group)
        return { ok: false as const, reason: 'invalid_token' as const };

      const [inserted] = await tx
        .insert(groupMembers)
        .values({ groupId: group.id, userId, role })
        .onConflictDoNothing({
          target: [groupMembers.groupId, groupMembers.userId],
        })
        .returning();

      if (!inserted) {
        return { ok: false as const, reason: 'already_member' as const };
      }

      return { ok: true as const, group };
    });
  }

  async findGroupByInviteToken(token: string): Promise<Group | null> {
    const [result] = await this.db
      .select()
      .from(groups)
      .where(eq(groups.inviteToken, token))
      .limit(1);
    return result ?? null;
  }

  async updateInviteToken(
    groupId: number,
    token: string | null,
  ): Promise<Group> {
    const [result] = await this.db
      .update(groups)
      .set({ inviteToken: token })
      .where(eq(groups.id, groupId))
      .returning();
    return result;
  }

  async countMembers(groupId: number): Promise<number> {
    const [result] = await this.db
      .select({ count: count() })
      .from(groupMembers)
      .where(eq(groupMembers.groupId, groupId));
    return result.count;
  }
}
