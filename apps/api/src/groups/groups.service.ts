import { Injectable, Logger } from '@nestjs/common';
import crypto from 'crypto';

import {
  CannotRemoveGroupAdminException,
  CannotTransferToSelfException,
  GroupNotFoundException,
  InviteNotFoundException,
  NotGroupAdminException,
  NotGroupMemberException,
  OnlyOneAdminException,
  CannotSetAdminRoleException,
  TargetNotGroupMemberException,
  UserAlreadyMemberException,
} from '$common/exceptions';
import type { Group, GroupMember, NewGroup } from '$db/schemas';
import { GroupMemberRole } from '$common/enums';

import {
  GroupCreateDto,
  GroupMemberAddDto,
  GroupMemberRoleUpdateDto,
  GroupUpdateDto,
} from './dto';
import { INVITE_TOKEN_BYTES } from './invite-token.constants';
import { GroupsRepository } from './groups.repository';

@Injectable()
export class GroupsService {
  private readonly _logger = new Logger(GroupsService.name);

  constructor(private readonly groupsRepository: GroupsRepository) {}

  async create(userId: number, dto: GroupCreateDto): Promise<Group> {
    const group = await this.groupsRepository.createGroup({
      name: dto.name,
      description: dto.description ?? null,
      avatarUrl: dto.avatarUrl ?? null,
    });

    const added = await this.groupsRepository.addMemberIfNotExists({
      groupId: group.id,
      userId,
      role: GroupMemberRole.ADMIN,
    });
    if (!added) {
      throw new UserAlreadyMemberException();
    }

    this._logger.log(`Group ${group.id} created by user ${userId}`);
    return group;
  }

  async findUserGroups(userId: number) {
    return this.groupsRepository.findGroupsByUserId(userId);
  }

  findAllGroups(): Promise<Group[]> {
    return this.groupsRepository.findAllGroups();
  }

  async findOne(
    id: number,
    member: GroupMember,
  ): Promise<Group & { currentUserRole: GroupMemberRole }> {
    const group = await this._getGroupOrThrow(id);

    return {
      ...group,
      currentUserRole: member.role as GroupMemberRole,
    };
  }

  async update(
    id: number,
    member: GroupMember,
    dto: GroupUpdateDto,
  ): Promise<Group> {
    const updateData: Partial<NewGroup> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.avatarUrl !== undefined) updateData.avatarUrl = dto.avatarUrl;

    const updatedGroup = await this.groupsRepository.updateGroup(
      id,
      updateData,
    );
    this._logger.log(`Group ${id} updated by user ${member.userId}`);
    return updatedGroup;
  }

  async remove(id: number, member: GroupMember): Promise<void> {
    await this.groupsRepository.deleteGroup(id);
    this._logger.log(`Group ${id} deleted by user ${member.userId}`);
  }

  async addMember(
    groupId: number,
    dto: GroupMemberAddDto,
    member: GroupMember,
  ): Promise<void> {
    const added = await this.groupsRepository.addMemberIfNotExists({
      groupId,
      userId: dto.userId,
      role: dto.role ?? GroupMemberRole.MEMBER,
    });
    if (!added) {
      throw new UserAlreadyMemberException();
    }

    this._logger.log(
      `User ${dto.userId} added to group ${groupId} by user ${member.userId}`,
    );
  }

  async removeMember(
    groupId: number,
    memberUserId: number,
    member: GroupMember,
  ): Promise<void> {
    const target = await this.groupsRepository.findMember(
      groupId,
      memberUserId,
    );

    if (!target) {
      throw new TargetNotGroupMemberException();
    }

    if (target.role === GroupMemberRole.ADMIN) {
      throw new CannotRemoveGroupAdminException();
    }

    const isAdmin = member.role === GroupMemberRole.ADMIN;

    if (!isAdmin && target.role === GroupMemberRole.MODERATOR) {
      throw new NotGroupAdminException();
    }

    await this.groupsRepository.removeMember(groupId, memberUserId);
    this._logger.log(
      `User ${memberUserId} removed from group ${groupId} by user ${member.userId}`,
    );
  }

  async updateMemberRole(
    groupId: number,
    memberUserId: number,
    dto: GroupMemberRoleUpdateDto,
    member: GroupMember,
  ): Promise<void> {
    if (dto.role === GroupMemberRole.ADMIN) {
      throw new CannotSetAdminRoleException();
    }

    await this.groupsRepository.updateMemberRole(
      groupId,
      memberUserId,
      dto.role,
    );

    this._logger.log(
      `User ${memberUserId} role updated to ${dto.role} in group ${groupId} by user ${member.userId}`,
    );
  }

  async transferOwnership(
    groupId: number,
    targetUserId: number,
    member: GroupMember,
  ): Promise<void> {
    if (targetUserId === member.userId) {
      throw new CannotTransferToSelfException();
    }

    const isTargetMember = await this.isMember(groupId, targetUserId);

    if (!isTargetMember) {
      throw new TargetNotGroupMemberException();
    }

    await this.groupsRepository.transferOwnership(
      groupId,
      member.userId,
      targetUserId,
    );
    this._logger.log(
      `Ownership of group ${groupId} transferred from user ${member.userId} to user ${targetUserId}`,
    );
  }

  async getMembers(
    groupId: number,
  ): Promise<
    Awaited<ReturnType<GroupsRepository['findMembersByGroupWithUsers']>>
  > {
    return this.groupsRepository.findMembersByGroupWithUsers(groupId);
  }

  async getMemberMe(
    groupId: number,
    member: GroupMember,
  ): Promise<Awaited<ReturnType<GroupsRepository['findMemberWithUser']>>> {
    return this.groupsRepository.findMemberWithUser(groupId, member.userId);
  }

  async isMember(groupId: number, userId: number): Promise<boolean> {
    const member = await this.groupsRepository.findMember(groupId, userId);
    return !!member;
  }

  async leaveGroup(groupId: number, userId: number): Promise<void> {
    await this._getGroupOrThrow(groupId);

    const member = await this.groupsRepository.findMember(groupId, userId);

    if (!member) {
      throw new NotGroupMemberException();
    }

    if (member.role === GroupMemberRole.ADMIN) {
      const adminCount = await this.groupsRepository.countAdmins(groupId);
      if (adminCount <= 1) {
        throw new OnlyOneAdminException();
      }
    }

    await this.groupsRepository.removeMember(groupId, userId);
    this._logger.log(`User ${userId} left group ${groupId}`);
  }

  async getInviteToken(
    groupId: number,
  ): Promise<{ inviteToken: string | null }> {
    const group = await this._getGroupOrThrow(groupId);
    return { inviteToken: group.inviteToken ?? null };
  }

  async generateInviteToken(
    groupId: number,
    member: GroupMember,
  ): Promise<{ inviteToken: string }> {
    const token = crypto.randomBytes(INVITE_TOKEN_BYTES).toString('hex');
    await this.groupsRepository.updateInviteToken(groupId, token);

    this._logger.log(
      `Invite token generated for group ${groupId} by user ${member.userId}`,
    );
    return { inviteToken: token };
  }

  async getInviteInfo(token: string): Promise<{
    id: number;
    name: string;
    description: string | null;
    avatarUrl: string | null;
    memberCount: number;
  }> {
    const group = await this._getGroupByInviteTokenOrThrow(token);
    const memberCount = await this.groupsRepository.countMembers(group.id);

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      avatarUrl: group.avatarUrl,
      memberCount,
    };
  }

  async acceptInvite(
    token: string,
    userId: number,
  ): Promise<{ groupId: number }> {
    const group = await this._getGroupByInviteTokenOrThrow(token);

    const added = await this.groupsRepository.addMemberIfNotExists({
      groupId: group.id,
      userId,
      role: GroupMemberRole.MEMBER,
    });
    if (!added) {
      throw new UserAlreadyMemberException();
    }

    this._logger.log(`User ${userId} joined group ${group.id} via invite link`);
    return { groupId: group.id };
  }

  private async _getGroupByInviteTokenOrThrow(token: string): Promise<Group> {
    const group = await this.groupsRepository.findGroupByInviteToken(token);

    if (!group) {
      throw new InviteNotFoundException();
    }

    return group;
  }

  private async _getGroupOrThrow(id: number): Promise<Group> {
    const group = await this.groupsRepository.findGroupById(id);

    if (!group) {
      throw new GroupNotFoundException(id);
    }

    return group;
  }
}
