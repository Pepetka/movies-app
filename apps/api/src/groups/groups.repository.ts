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
import { DRIZZLE } from '$db/db.module';

@Injectable()
export class GroupsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async createGroup(data: NewGroup): Promise<Group> {
    const [result] = await this.db.insert(groups).values(data).returning();
    return result;
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

  async findGroupsByUserId(userId: number): Promise<Group[]> {
    const result = this.db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        avatarUrl: groups.avatarUrl,
        ownerId: groups.ownerId,
        createdAt: groups.createdAt,
        updatedAt: groups.updatedAt,
      })
      .from(groups)
      .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
      .where(eq(groupMembers.userId, userId))
      .orderBy(groupMembers.createdAt);

    return result as unknown as Group[];
  }

  async updateGroup(id: number, data: Partial<NewGroup>): Promise<Group> {
    const [result] = await this.db
      .update(groups)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(groups.id, id))
      .returning();
    return result;
  }

  async deleteGroup(id: number): Promise<void> {
    await this.db.delete(groups).where(eq(groups.id, id));
  }

  async addMember(data: NewGroupMember): Promise<GroupMember> {
    const [result] = await this.db
      .insert(groupMembers)
      .values(data)
      .returning();
    return result;
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

  async findMembersByGroupWithUsers(groupId: number) {
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
          email: users.email,
        },
      })
      .from(groupMembers)
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(eq(groupMembers.groupId, groupId))
      .orderBy(groupMembers.createdAt);
  }

  async updateMemberRole(
    groupId: number,
    userId: number,
    role: GroupMemberRole,
  ): Promise<GroupMember> {
    const [result] = await this.db
      .update(groupMembers)
      .set({ role, updatedAt: new Date() })
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

  async getGroupWithMember(
    groupId: number,
    userId: number,
  ): Promise<{ group: Group; member: GroupMember | null } | null> {
    const result = await this.db
      .select({
        groupId: groups.id,
        groupName: groups.name,
        groupDescription: groups.description,
        groupAvatarUrl: groups.avatarUrl,
        groupOwnerId: groups.ownerId,
        groupCreatedAt: groups.createdAt,
        groupUpdatedAt: groups.updatedAt,
        memberId: groupMembers.id,
        memberUserId: groupMembers.userId,
        memberRole: groupMembers.role,
        memberCreatedAt: groupMembers.createdAt,
        memberUpdatedAt: groupMembers.updatedAt,
      })
      .from(groups)
      .leftJoin(
        groupMembers,
        and(
          eq(groups.id, groupMembers.groupId),
          eq(groupMembers.userId, userId),
        ),
      )
      .where(eq(groups.id, groupId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const row = result[0];

    const member =
      row.memberId &&
      row.memberRole &&
      row.memberUserId &&
      row.memberCreatedAt &&
      row.memberUpdatedAt
        ? {
            id: row.memberId,
            groupId: row.groupId,
            userId: row.memberUserId,
            role: row.memberRole,
            createdAt: row.memberCreatedAt,
            updatedAt: row.memberUpdatedAt,
          }
        : null;

    return {
      group: {
        id: row.groupId,
        name: row.groupName,
        description: row.groupDescription,
        avatarUrl: row.groupAvatarUrl,
        ownerId: row.groupOwnerId,
        createdAt: row.groupCreatedAt,
        updatedAt: row.groupUpdatedAt,
      },
      member,
    };
  }

  async countAdmins(groupId: number): Promise<number> {
    const [result] = await this.db
      .select({ count: count() })
      .from(groupMembers)
      .where(
        and(eq(groupMembers.groupId, groupId), eq(groupMembers.role, 'admin')),
      );
    return result.count;
  }

  async findAdminByGroup(groupId: number): Promise<GroupMember | null> {
    const [result] = await this.db
      .select()
      .from(groupMembers)
      .where(
        and(eq(groupMembers.groupId, groupId), eq(groupMembers.role, 'admin')),
      )
      .limit(1);
    return result ?? null;
  }

  async transferOwnership(
    groupId: number,
    currentAdminId: number,
    targetUserId: number,
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx
        .update(groupMembers)
        .set({ role: GroupMemberRole.MODERATOR, updatedAt: new Date() })
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, currentAdminId),
          ),
        );

      await tx
        .update(groupMembers)
        .set({ role: GroupMemberRole.ADMIN, updatedAt: new Date() })
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, targetUserId),
          ),
        );
    });
  }
}
