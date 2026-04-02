import { Test, TestingModule } from '@nestjs/testing';

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
import { GroupMemberRole } from '$common/enums';
import type { GroupMember } from '$db/schemas';

import { GroupsRepository } from './groups.repository';
import { GroupCreateDto, GroupUpdateDto } from './dto';
import { GroupsService } from './groups.service';

const mockGroup = {
  id: 1,
  name: 'Test Group',
  description: 'Test Description',
  avatarUrl: 'https://example.com/avatar.jpg',
  inviteToken: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockGroupMember = {
  id: 1,
  groupId: 1,
  userId: 2,
  role: GroupMemberRole.MEMBER,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: {
    id: 2,
    name: 'Test User',
  },
};

const mockAdminMember: GroupMember = {
  id: 10,
  groupId: 1,
  userId: 1,
  role: GroupMemberRole.ADMIN,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockModeratorMember: GroupMember = {
  id: 11,
  groupId: 1,
  userId: 2,
  role: GroupMemberRole.MODERATOR,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRegularMember: GroupMember = {
  id: 12,
  groupId: 1,
  userId: 3,
  role: GroupMemberRole.MEMBER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const createMockGroupsRepository = () => ({
  createGroup: jest.fn(),
  createGroupWithAdmin: jest.fn(),
  findGroupById: jest.fn(),
  findAllGroups: jest.fn(),
  findGroupsByUserId: jest.fn(),
  updateGroup: jest.fn(),
  deleteGroup: jest.fn(),
  addMemberIfNotExists: jest.fn(),
  addMemberToGroupByInvite: jest.fn(),
  findMember: jest.fn(),
  findMembersByGroupWithUsers: jest.fn(),
  findMemberWithUser: jest.fn(),
  updateMemberRole: jest.fn(),
  removeMember: jest.fn(),
  countAdmins: jest.fn(),
  transferOwnership: jest.fn(),
  findGroupByInviteToken: jest.fn(),
  updateInviteToken: jest.fn(),
  countMembers: jest.fn(),
});

describe('GroupsService', () => {
  let service: GroupsService;
  let groupsRepository: ReturnType<typeof createMockGroupsRepository>;

  beforeEach(async () => {
    const mockRepo = createMockGroupsRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        {
          provide: GroupsRepository,
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
    groupsRepository = mockRepo as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: GroupCreateDto = {
      name: 'Test Group',
      description: 'Test Description',
      avatarUrl: 'https://example.com/avatar.jpg',
    };

    it('should create group and add user as admin', async () => {
      groupsRepository.createGroupWithAdmin.mockResolvedValue(mockGroup);

      const result = await service.create(1, createDto);

      expect(result).toEqual(mockGroup);
      expect(groupsRepository.createGroupWithAdmin).toHaveBeenCalledWith(
        {
          name: createDto.name,
          description: createDto.description,
          avatarUrl: createDto.avatarUrl,
        },
        {
          userId: 1,
          role: GroupMemberRole.ADMIN,
        },
      );
    });
  });

  describe('findUserGroups', () => {
    it('should return groups for user', async () => {
      const mockGroups = [mockGroup];
      groupsRepository.findGroupsByUserId.mockResolvedValue(mockGroups);

      const result = await service.findUserGroups(1);

      expect(result).toEqual(mockGroups);
      expect(groupsRepository.findGroupsByUserId).toHaveBeenCalledWith(1);
    });
  });

  describe('findAllGroups', () => {
    it('should return all groups', async () => {
      const mockGroups = [mockGroup];
      groupsRepository.findAllGroups.mockResolvedValue(mockGroups);

      const result = await service.findAllGroups();

      expect(result).toEqual(mockGroups);
      expect(groupsRepository.findAllGroups).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return group for member', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);

      const result = await service.findOne(1, mockRegularMember);

      expect(result).toEqual({
        ...mockGroup,
        currentUserRole: mockRegularMember.role,
      });
      expect(groupsRepository.findGroupById).toHaveBeenCalledWith(1);
    });

    it('should throw GroupNotFoundException for non-existent group', async () => {
      groupsRepository.findGroupById.mockResolvedValue(null);

      await expect(service.findOne(999, mockRegularMember)).rejects.toThrow(
        GroupNotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto: GroupUpdateDto = {
      name: 'Updated Name',
      description: 'Updated Description',
    };

    it('should update group as moderator', async () => {
      groupsRepository.updateGroup.mockResolvedValue(mockGroup);

      const result = await service.update(1, mockModeratorMember, updateDto);

      expect(result).toEqual(mockGroup);
      expect(groupsRepository.updateGroup).toHaveBeenCalledWith(1, {
        name: 'Updated Name',
        description: 'Updated Description',
      });
    });

    it('should update group as admin', async () => {
      groupsRepository.updateGroup.mockResolvedValue(mockGroup);

      await service.update(1, mockAdminMember, updateDto);

      expect(groupsRepository.updateGroup).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete group as admin', async () => {
      groupsRepository.deleteGroup.mockResolvedValue(undefined);

      await service.remove(1, mockAdminMember);

      expect(groupsRepository.deleteGroup).toHaveBeenCalledWith(1);
    });
  });

  describe('addMember', () => {
    it('should add member as moderator', async () => {
      groupsRepository.addMemberIfNotExists.mockResolvedValue(mockGroupMember);

      await service.addMember(1, { userId: 3 }, mockModeratorMember);

      expect(groupsRepository.addMemberIfNotExists).toHaveBeenCalledWith({
        groupId: 1,
        userId: 3,
        role: GroupMemberRole.MEMBER,
      });
    });

    it('should add member with specified role', async () => {
      groupsRepository.addMemberIfNotExists.mockResolvedValue(mockGroupMember);

      await service.addMember(
        1,
        { userId: 3, role: GroupMemberRole.MODERATOR },
        mockAdminMember,
      );

      expect(groupsRepository.addMemberIfNotExists).toHaveBeenCalledWith({
        groupId: 1,
        userId: 3,
        role: GroupMemberRole.MODERATOR,
      });
    });

    it('should throw UserAlreadyMemberException for existing member', async () => {
      groupsRepository.addMemberIfNotExists.mockResolvedValue(null);

      await expect(
        service.addMember(1, { userId: 2 }, mockAdminMember),
      ).rejects.toThrow(UserAlreadyMemberException);
    });
  });

  describe('removeMember', () => {
    it('should remove regular member as admin', async () => {
      groupsRepository.findMember.mockResolvedValue({
        ...mockGroupMember,
        userId: 3,
        role: GroupMemberRole.MEMBER,
      });
      groupsRepository.removeMember.mockResolvedValue(undefined);

      await service.removeMember(1, 3, mockAdminMember);

      expect(groupsRepository.removeMember).toHaveBeenCalledWith(1, 3);
    });

    it('should remove regular member as moderator', async () => {
      groupsRepository.findMember.mockResolvedValue({
        ...mockGroupMember,
        userId: 3,
        role: GroupMemberRole.MEMBER,
      });
      groupsRepository.removeMember.mockResolvedValue(undefined);

      await service.removeMember(1, 3, mockModeratorMember);

      expect(groupsRepository.removeMember).toHaveBeenCalledWith(1, 3);
    });

    it('should throw CannotRemoveGroupAdminException when trying to remove admin', async () => {
      groupsRepository.findMember.mockResolvedValue({
        ...mockGroupMember,
        role: GroupMemberRole.ADMIN,
      });

      await expect(
        service.removeMember(1, 2, mockModeratorMember),
      ).rejects.toThrow(CannotRemoveGroupAdminException);
    });

    it('should throw NotGroupAdminException when moderator tries to remove moderator', async () => {
      groupsRepository.findMember.mockResolvedValue({
        ...mockGroupMember,
        userId: 3,
        role: GroupMemberRole.MODERATOR,
      });

      await expect(
        service.removeMember(1, 3, mockModeratorMember),
      ).rejects.toThrow(NotGroupAdminException);
    });

    it('should throw TargetNotGroupMemberException when target is not a member', async () => {
      groupsRepository.findMember.mockResolvedValue(null);

      await expect(
        service.removeMember(1, 999, mockAdminMember),
      ).rejects.toThrow(TargetNotGroupMemberException);
    });
  });

  describe('updateMemberRole', () => {
    it('should update role to moderator as admin', async () => {
      groupsRepository.updateMemberRole.mockResolvedValue({
        ...mockRegularMember,
        role: GroupMemberRole.MODERATOR,
      });

      await service.updateMemberRole(
        1,
        2,
        { role: GroupMemberRole.MODERATOR },
        mockAdminMember,
      );

      expect(groupsRepository.updateMemberRole).toHaveBeenCalledWith(
        1,
        2,
        GroupMemberRole.MODERATOR,
      );
    });

    it('should throw CannotSetAdminRoleException when promoting to admin', async () => {
      await expect(
        service.updateMemberRole(
          1,
          2,
          { role: GroupMemberRole.ADMIN },
          mockAdminMember,
        ),
      ).rejects.toThrow(CannotSetAdminRoleException);
    });
  });

  describe('transferOwnership', () => {
    it('should transfer ownership as admin', async () => {
      groupsRepository.findMember.mockResolvedValue(mockRegularMember);
      groupsRepository.transferOwnership.mockResolvedValue(undefined);

      await service.transferOwnership(1, 3, mockAdminMember);

      expect(groupsRepository.transferOwnership).toHaveBeenCalledWith(1, 1, 3);
    });

    it('should throw CannotTransferToSelfException when transferring to self', async () => {
      await expect(
        service.transferOwnership(1, mockAdminMember.userId, mockAdminMember),
      ).rejects.toThrow(CannotTransferToSelfException);
    });

    it('should throw TargetNotGroupMemberException when target is not a member', async () => {
      groupsRepository.findMember.mockResolvedValue(null);

      await expect(
        service.transferOwnership(1, 3, mockAdminMember),
      ).rejects.toThrow(TargetNotGroupMemberException);
    });
  });

  describe('getMembers', () => {
    it('should return members', async () => {
      const mockMembers = [mockGroupMember];
      groupsRepository.findMembersByGroupWithUsers.mockResolvedValue(
        mockMembers,
      );

      const result = await service.getMembers(1);

      expect(result).toEqual(mockMembers);
      expect(groupsRepository.findMembersByGroupWithUsers).toHaveBeenCalledWith(
        1,
      );
    });
  });

  describe('getMemberMe', () => {
    it('should return member info for group member', async () => {
      groupsRepository.findMemberWithUser.mockResolvedValue(mockGroupMember);

      const result = await service.getMemberMe(1, mockRegularMember);

      expect(result).toEqual(mockGroupMember);
      expect(groupsRepository.findMemberWithUser).toHaveBeenCalledWith(1, 3);
    });
  });

  describe('leaveGroup', () => {
    it('should allow member to leave group', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.findMember.mockResolvedValue({
        ...mockGroupMember,
        role: GroupMemberRole.MEMBER,
      });
      groupsRepository.removeMember.mockResolvedValue(undefined);

      await service.leaveGroup(1, 2);

      expect(groupsRepository.removeMember).toHaveBeenCalledWith(1, 2);
    });

    it('should throw GroupNotFoundException for non-existent group', async () => {
      groupsRepository.findGroupById.mockResolvedValue(null);

      await expect(service.leaveGroup(999, 1)).rejects.toThrow(
        GroupNotFoundException,
      );
    });

    it('should throw NotGroupMemberException for non-member', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.findMember.mockResolvedValue(null);

      await expect(service.leaveGroup(1, 2)).rejects.toThrow(
        NotGroupMemberException,
      );
    });

    it('should throw OnlyOneAdminException when last admin tries to leave', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.findMember.mockResolvedValue({
        ...mockGroupMember,
        role: GroupMemberRole.ADMIN,
      });
      groupsRepository.countAdmins.mockResolvedValue(1);

      await expect(service.leaveGroup(1, 1)).rejects.toThrow(
        OnlyOneAdminException,
      );
    });

    it('should allow admin to leave when other admins exist', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.findMember.mockResolvedValue({
        ...mockGroupMember,
        role: GroupMemberRole.ADMIN,
      });
      groupsRepository.countAdmins.mockResolvedValue(2);
      groupsRepository.removeMember.mockResolvedValue(undefined);

      await service.leaveGroup(1, 1);

      expect(groupsRepository.removeMember).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('getInviteToken', () => {
    it('should return invite token for group', async () => {
      groupsRepository.findGroupById.mockResolvedValue({
        ...mockGroup,
        inviteToken: 'existing-token',
      });

      const result = await service.getInviteToken(1);

      expect(result).toEqual({ inviteToken: 'existing-token' });
      expect(groupsRepository.findGroupById).toHaveBeenCalledWith(1);
    });

    it('should return null when no token exists', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);

      const result = await service.getInviteToken(1);

      expect(result).toEqual({ inviteToken: null });
    });

    it('should throw GroupNotFoundException for non-existent group', async () => {
      groupsRepository.findGroupById.mockResolvedValue(null);

      await expect(service.getInviteToken(999)).rejects.toThrow(
        GroupNotFoundException,
      );
    });
  });

  describe('generateInviteToken', () => {
    it('should generate token and save it to group', async () => {
      groupsRepository.updateInviteToken.mockResolvedValue({
        ...mockGroup,
        inviteToken: 'new-token',
      });

      const result = await service.generateInviteToken(1, mockModeratorMember);

      expect(result).toEqual({ inviteToken: expect.any(String) });
      expect(groupsRepository.updateInviteToken).toHaveBeenCalledWith(
        1,
        expect.any(String),
      );
    });
  });

  describe('getInviteInfo', () => {
    it('should return group info with member count', async () => {
      const groupWithToken = { ...mockGroup, inviteToken: 'valid-token' };
      groupsRepository.findGroupByInviteToken.mockResolvedValue(groupWithToken);
      groupsRepository.countMembers.mockResolvedValue(5);

      const result = await service.getInviteInfo('valid-token');

      expect(result).toEqual({
        id: groupWithToken.id,
        name: groupWithToken.name,
        description: groupWithToken.description,
        avatarUrl: groupWithToken.avatarUrl,
        memberCount: 5,
      });
    });

    it('should throw InviteNotFoundException for invalid token', async () => {
      groupsRepository.findGroupByInviteToken.mockResolvedValue(null);

      await expect(service.getInviteInfo('invalid')).rejects.toThrow(
        InviteNotFoundException,
      );
    });
  });

  describe('acceptInvite', () => {
    it('should add user as member and return groupId', async () => {
      const groupWithToken = { ...mockGroup, inviteToken: 'valid-token' };
      groupsRepository.addMemberToGroupByInvite.mockResolvedValue({
        ok: true,
        group: groupWithToken,
      });

      const result = await service.acceptInvite('valid-token', 3);

      expect(result).toEqual({ groupId: groupWithToken.id });
      expect(groupsRepository.addMemberToGroupByInvite).toHaveBeenCalledWith(
        'valid-token',
        3,
        GroupMemberRole.MEMBER,
      );
    });

    it('should throw UserAlreadyMemberException when already a member', async () => {
      groupsRepository.addMemberToGroupByInvite.mockResolvedValue({
        ok: false,
        reason: 'already_member',
      });

      await expect(service.acceptInvite('valid-token', 2)).rejects.toThrow(
        UserAlreadyMemberException,
      );
    });

    it('should throw InviteNotFoundException when token is invalid', async () => {
      groupsRepository.addMemberToGroupByInvite.mockResolvedValue({
        ok: false,
        reason: 'invalid_token',
      });

      await expect(service.acceptInvite('invalid-token', 2)).rejects.toThrow(
        InviteNotFoundException,
      );
    });
  });
});
