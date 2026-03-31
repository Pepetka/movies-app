import { Injectable, Logger } from '@nestjs/common';
import crypto from 'crypto';

import {
  CannotRemoveGroupAdminException,
  CannotTransferToSelfException,
  GroupNotFoundException,
  InviteNotFoundException,
  NotGroupAdminException,
  NotGroupMemberException,
  NotGroupModeratorException,
  OnlyAdminCanTransferException,
  OnlyOneAdminException,
  TargetNotGroupMemberException,
  UserAlreadyMemberException,
} from '$common/exceptions';
import { GroupMemberRole } from '$common/enums';
import type { Group } from '$db/schemas';

import {
  GroupCreateDto,
  GroupMemberAddDto,
  GroupMemberRoleUpdateDto,
  GroupUpdateDto,
} from './dto';
import { GroupsRepository } from './groups.repository';

@Injectable()
export class GroupsService {
  private readonly _logger = new Logger(GroupsService.name);

  constructor(private readonly groupsRepository: GroupsRepository) {}

  /**
   * Creates a new group and makes the user admin
   * @param userId - User ID who will become owner
   * @param dto - Group creation data
   * @returns Created group
   */
  async create(userId: number, dto: GroupCreateDto): Promise<Group> {
    const group = await this.groupsRepository.createGroup({
      name: dto.name,
      description: dto.description ?? null,
      avatarUrl: dto.avatarUrl ?? null,
    });

    await this.groupsRepository.addMember({
      groupId: group.id,
      userId,
      role: GroupMemberRole.ADMIN,
    });

    this._logger.log(`Group ${group.id} created by user ${userId}`);
    return group;
  }

  /**
   * Gets all groups where user is a member
   * @param userId - User ID
   * @returns Array of groups
   */
  async findUserGroups(userId: number): Promise<Group[]> {
    return this.groupsRepository.findGroupsByUserId(userId);
  }

  /**
   * Gets all groups (admin endpoint)
   * @returns Array of all groups
   */
  findAllGroups(): Promise<Group[]> {
    return this.groupsRepository.findAllGroups();
  }

  /**
   * Gets user's groups where user is admin
   * @param userId - User ID
   * @returns Array of groups where user is admin
   */
  findUserGroupsByAdmin(userId: number): Promise<Group[]> {
    return this.groupsRepository.findGroupsByUserId(userId);
  }

  /**
   * Gets a single group by ID with current user's role
   * @param id - Group ID
   * @param userId - User ID for membership check
   * @returns Group with current user role
   * @throws GroupNotFoundException if group not found
   * @throws NotGroupMemberException if user not member
   */
  async findOne(
    id: number,
    userId: number,
  ): Promise<Group & { currentUserRole: GroupMemberRole }> {
    const group = await this.groupsRepository.findGroupById(id);

    if (!group) {
      throw new GroupNotFoundException(id);
    }

    const memberData = await this.groupsRepository.getGroupWithMember(
      id,
      userId,
    );

    if (!memberData?.member) {
      throw new NotGroupMemberException();
    }

    const role = memberData.member.role;
    if (!Object.values(GroupMemberRole).includes(role as GroupMemberRole)) {
      throw new Error(`Invalid role value: ${role}`);
    }

    return {
      ...group,
      currentUserRole: role as GroupMemberRole,
    };
  }

  /**
   * Updates group information
   * @param id - Group ID
   * @param userId - User ID making the request
   * @param dto - Update data
   * @returns Updated group
   */
  async update(
    id: number,
    userId: number,
    dto: GroupUpdateDto,
  ): Promise<Group> {
    const group = await this.groupsRepository.findGroupById(id);

    if (!group) {
      throw new GroupNotFoundException(id);
    }

    const canModerate = await this.canModerate(id, userId);

    if (!canModerate) {
      throw new NotGroupModeratorException();
    }

    const updateData: Partial<Record<string, unknown>> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.avatarUrl !== undefined) updateData.avatarUrl = dto.avatarUrl;

    const updatedGroup = await this.groupsRepository.updateGroup(
      id,
      updateData,
    );
    this._logger.log(`Group ${id} updated by user ${userId}`);
    return updatedGroup;
  }

  /**
   * Deletes a group (admin only)
   * @param id - Group ID
   * @param userId - User ID making the request
   */
  async remove(id: number, userId: number): Promise<void> {
    const group = await this.groupsRepository.findGroupById(id);

    if (!group) {
      throw new GroupNotFoundException(id);
    }

    const isAdmin = await this.isAdmin(id, userId);

    if (!isAdmin) {
      throw new NotGroupAdminException();
    }

    await this.groupsRepository.deleteGroup(id);
    this._logger.log(`Group ${id} deleted by user ${userId}`);
  }

  /**
   * Adds a member to group (moderator+ only)
   * @param groupId - Group ID
   * @param dto - Member addition data
   * @param requesterId - User ID making the request
   */
  async addMember(
    groupId: number,
    dto: GroupMemberAddDto,
    requesterId: number,
  ): Promise<void> {
    const group = await this.groupsRepository.findGroupById(groupId);

    if (!group) {
      throw new GroupNotFoundException(groupId);
    }

    const canModerate = await this.canModerate(groupId, requesterId);

    if (!canModerate) {
      throw new NotGroupModeratorException();
    }

    const existingMember = await this.groupsRepository.findMember(
      groupId,
      dto.userId,
    );

    if (existingMember) {
      throw new UserAlreadyMemberException();
    }

    await this.groupsRepository.addMember({
      groupId,
      userId: dto.userId,
      role: dto.role ?? GroupMemberRole.MEMBER,
    });

    this._logger.log(
      `User ${dto.userId} added to group ${groupId} by user ${requesterId}`,
    );
  }

  /**
   * Removes a member from group
   * @param groupId - Group ID
   * @param memberUserId - User ID to remove
   * @param requesterId - User ID making the request
   */
  async removeMember(
    groupId: number,
    memberUserId: number,
    requesterId: number,
  ): Promise<void> {
    const group = await this.groupsRepository.findGroupById(groupId);

    if (!group) {
      throw new GroupNotFoundException(groupId);
    }

    const member = await this.groupsRepository.findMember(
      groupId,
      memberUserId,
    );

    if (member?.role === GroupMemberRole.ADMIN) {
      throw new CannotRemoveGroupAdminException();
    }

    const requester = await this.groupsRepository.findMember(
      groupId,
      requesterId,
    );

    if (!requester) {
      throw new NotGroupMemberException();
    }

    const isAdmin = requester.role === GroupMemberRole.ADMIN;

    if (!isAdmin && member?.role === GroupMemberRole.MODERATOR) {
      throw new NotGroupAdminException();
    }

    await this.groupsRepository.removeMember(groupId, memberUserId);
    this._logger.log(
      `User ${memberUserId} removed from group ${groupId} by user ${requesterId}`,
    );
  }

  /**
   * Updates member role (admin only)
   * @param groupId - Group ID
   * @param memberUserId - User ID to update
   * @param dto - Role update data
   * @param requesterId - User ID making the request
   */
  async updateMemberRole(
    groupId: number,
    memberUserId: number,
    dto: GroupMemberRoleUpdateDto,
    requesterId: number,
  ): Promise<void> {
    const group = await this.groupsRepository.findGroupById(groupId);

    if (!group) {
      throw new GroupNotFoundException(groupId);
    }

    const isAdmin = await this.isAdmin(groupId, requesterId);

    if (!isAdmin) {
      throw new NotGroupAdminException();
    }

    const result = await this.groupsRepository.setAdminRoleInTransaction(
      groupId,
      memberUserId,
      dto.role,
    );

    if (!result.success) {
      throw new OnlyOneAdminException();
    }

    this._logger.log(
      `User ${memberUserId} role updated to ${dto.role} in group ${groupId} by user ${requesterId}`,
    );
  }

  /**
   * Transfers group ownership to another member (admin only)
   * @param groupId - Group ID
   * @param targetUserId - User ID to become new owner
   * @param requesterId - Current owner user ID
   */
  async transferOwnership(
    groupId: number,
    targetUserId: number,
    requesterId: number,
  ): Promise<void> {
    const group = await this.groupsRepository.findGroupById(groupId);

    if (!group) {
      throw new GroupNotFoundException(groupId);
    }

    const isAdmin = await this.isAdmin(groupId, requesterId);

    if (!isAdmin) {
      throw new OnlyAdminCanTransferException();
    }

    if (targetUserId === requesterId) {
      throw new CannotTransferToSelfException();
    }

    const isTargetMember = await this.isMember(groupId, targetUserId);

    if (!isTargetMember) {
      throw new TargetNotGroupMemberException();
    }

    await this.groupsRepository.transferOwnership(
      groupId,
      requesterId,
      targetUserId,
    );
    this._logger.log(
      `Ownership of group ${groupId} transferred from user ${requesterId} to user ${targetUserId}`,
    );
  }

  /**
   * Gets all members of a group
   * @param groupId - Group ID
   * @param userId - User ID for membership check
   * @returns Array of group members with user data
   */
  async getMembers(groupId: number, userId: number) {
    const group = await this.groupsRepository.findGroupById(groupId);

    if (!group) {
      throw new GroupNotFoundException(groupId);
    }

    const isMember = await this.isMember(groupId, userId);

    if (!isMember) {
      throw new NotGroupMemberException();
    }

    return this.groupsRepository.findMembersByGroupWithUsers(groupId);
  }

  /**
   * Gets current user's membership in a group
   * @param groupId - Group ID
   * @param userId - User ID
   * @returns User's group member data
   */
  async getMemberMe(groupId: number, userId: number) {
    const group = await this.groupsRepository.findGroupById(groupId);

    if (!group) {
      throw new GroupNotFoundException(groupId);
    }

    const member = await this.groupsRepository.findMemberWithUser(
      groupId,
      userId,
    );

    if (!member) {
      throw new NotGroupMemberException();
    }

    return member;
  }

  /**
   * Checks if user is a group member
   * @param groupId - Group ID
   * @param userId - User ID
   * @returns true if user is a member
   */
  async isMember(groupId: number, userId: number): Promise<boolean> {
    const member = await this.groupsRepository.findMember(groupId, userId);
    return !!member;
  }

  /**
   * Checks if user is a group admin
   * @param groupId - Group ID
   * @param userId - User ID
   * @returns true if user is an admin
   */
  async isAdmin(groupId: number, userId: number): Promise<boolean> {
    const member = await this.groupsRepository.findMember(groupId, userId);
    return member?.role === GroupMemberRole.ADMIN;
  }

  /**
   * Removes user from group (leave action)
   * @param groupId - Group ID
   * @param userId - User ID leaving the group
   */
  async leaveGroup(groupId: number, userId: number): Promise<void> {
    const group = await this.groupsRepository.findGroupById(groupId);

    if (!group) {
      throw new GroupNotFoundException(groupId);
    }

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

  /**
   * Checks if user can moderate group (admin or moderator)
   * @param groupId - Group ID
   * @param userId - User ID
   * @returns true if user can moderate
   */
  async canModerate(groupId: number, userId: number): Promise<boolean> {
    const data = await this.groupsRepository.getGroupWithMember(
      groupId,
      userId,
    );

    if (!data) {
      return false;
    }

    const role = data.member?.role;
    return role === GroupMemberRole.ADMIN || role === GroupMemberRole.MODERATOR;
  }

  /**
   * Generates or regenerates invite token for group
   * @param groupId - Group ID
   * @param userId - User ID (must be moderator+)
   * @returns Object with generated invite token
   */
  async generateInviteToken(
    groupId: number,
    userId: number,
  ): Promise<{ inviteToken: string }> {
    const group = await this.groupsRepository.findGroupById(groupId);

    if (!group) {
      throw new GroupNotFoundException(groupId);
    }

    const canModerate = await this.canModerate(groupId, userId);

    if (!canModerate) {
      throw new NotGroupModeratorException();
    }

    const token = crypto.randomBytes(16).toString('hex');
    await this.groupsRepository.updateInviteToken(groupId, token);

    this._logger.log(
      `Invite token generated for group ${groupId} by user ${userId}`,
    );
    return { inviteToken: token };
  }

  /**
   * Returns group info by invite token (public)
   * @param token - Invite token
   * @returns Group info with member count
   */
  async getInviteInfo(token: string) {
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

  /**
   * Accepts invite and adds user to group as member
   * @param token - Invite token
   * @param userId - User ID accepting the invite
   * @returns Object with group ID
   */
  async acceptInvite(
    token: string,
    userId: number,
  ): Promise<{ groupId: number }> {
    const group = await this._getGroupByInviteTokenOrThrow(token);

    const existingMember = await this.groupsRepository.findMember(
      group.id,
      userId,
    );

    if (existingMember) {
      throw new UserAlreadyMemberException();
    }

    await this.groupsRepository.addMember({
      groupId: group.id,
      userId,
      role: GroupMemberRole.MEMBER,
    });

    this._logger.log(`User ${userId} joined group ${group.id} via invite link`);
    return { groupId: group.id };
  }

  private async _getGroupByInviteTokenOrThrow(token: string) {
    const group = await this.groupsRepository.findGroupByInviteToken(token);

    if (!group) {
      throw new InviteNotFoundException();
    }

    return group;
  }
}
