import { Test, TestingModule } from '@nestjs/testing';

import {
  CannotRemoveGroupAdminException,
  CannotTransferToSelfException,
  GroupNotFoundException,
  InviteNotFoundException,
  NotGroupAdminException,
  NotGroupMemberException,
  OnlyOneAdminException,
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
    email: 'test@example.com',
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
  findGroupById: jest.fn(),
  findAllGroups: jest.fn(),
  findGroupsByUserId: jest.fn(),
  updateGroup: jest.fn(),
  deleteGroup: jest.fn(),
  addMemberIfNotExists: jest.fn(),
  findMember: jest.fn(),
  findMembersByGroupWithUsers: jest.fn(),
  findMemberWithUser: jest.fn(),
  updateMemberRole: jest.fn(),
  setAdminRoleInTransaction: jest.fn(),
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
      groupsRepository.createGroup.mockResolvedValue(mockGroup);
      groupsRepository.addMemberIfNotExists.mockResolvedValue(mockGroupMember);

      const result = await service.create(1, createDto);

      expect(result).toEqual(mockGroup);
      expect(groupsRepository.createGroup).toHaveBeenCalledWith({
        name: createDto.name,
        description: createDto.description,
        avatarUrl: createDto.avatarUrl,
      });
      expect(groupsRepository.addMemberIfNotExists).toHaveBeenCalledWith({
        groupId: mockGroup.id,
        userId: 1,
        role: GroupMemberRole.ADMIN,
      });
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

  describe('findUserGroupsByAdmin', () => {
    it('should return groups where user is admin', async () => {
      const mockGroups = [mockGroup];
      groupsRepository.findGroupsByUserId.mockResolvedValue(mockGroups);

      const result = await service.findUserGroupsByAdmin(1);

      expect(result).toEqual(mockGroups);
      expect(groupsRepository.findGroupsByUserId).toHaveBeenCalledWith(1);
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
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.updateGroup.mockResolvedValue(mockGroup);

      const result = await service.update(1, mockModeratorMember, updateDto);

      expect(result).toEqual(mockGroup);
      expect(groupsRepository.updateGroup).toHaveBeenCalledWith(1, {
        name: 'Updated Name',
        description: 'Updated Description',
      });
    });

    it('should update group as admin', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.updateGroup.mockResolvedValue(mockGroup);

      await service.update(1, mockAdminMember, updateDto);

      expect(groupsRepository.updateGroup).toHaveBeenCalled();
    });

    it('should throw GroupNotFoundException for non-existent group', async () => {
      groupsRepository.findGroupById.mockResolvedValue(null);

      await expect(
        service.update(999, mockModeratorMember, updateDto),
      ).rejects.toThrow(GroupNotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete group as admin', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.deleteGroup.mockResolvedValue(undefined);

      await service.remove(1, mockAdminMember);

      expect(groupsRepository.deleteGroup).toHaveBeenCalledWith(1);
    });

    it('should throw GroupNotFoundException for non-existent group', async () => {
      groupsRepository.findGroupById.mockResolvedValue(null);

      await expect(service.remove(999, mockAdminMember)).rejects.toThrow(
        GroupNotFoundException,
      );
    });
  });

  describe('addMember', () => {
    it('should add member as moderator', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.addMemberIfNotExists.mockResolvedValue(mockGroupMember);

      await service.addMember(1, { userId: 3 }, mockModeratorMember);

      expect(groupsRepository.addMemberIfNotExists).toHaveBeenCalledWith({
        groupId: 1,
        userId: 3,
        role: GroupMemberRole.MEMBER,
      });
    });

    it('should add member with specified role', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
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

    it('should throw GroupNotFoundException for non-existent group', async () => {
      groupsRepository.findGroupById.mockResolvedValue(null);

      await expect(
        service.addMember(999, { userId: 3 }, mockModeratorMember),
      ).rejects.toThrow(GroupNotFoundException);
    });

    it('should throw UserAlreadyMemberException for existing member', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.addMemberIfNotExists.mockResolvedValue(null);

      await expect(
        service.addMember(1, { userId: 2 }, mockAdminMember),
      ).rejects.toThrow(UserAlreadyMemberException);
    });
  });

  describe('removeMember', () => {
    it('should remove regular member as admin', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
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
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
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
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.findMember.mockResolvedValue({
        ...mockGroupMember,
        role: GroupMemberRole.ADMIN,
      });

      await expect(
        service.removeMember(1, 2, mockModeratorMember),
      ).rejects.toThrow(CannotRemoveGroupAdminException);
    });

    it('should throw NotGroupAdminException when moderator tries to remove moderator', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
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
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.findMember.mockResolvedValue(null);

      await expect(
        service.removeMember(1, 999, mockAdminMember),
      ).rejects.toThrow(TargetNotGroupMemberException);
    });
  });

  describe('updateMemberRole', () => {
    it('should update role to moderator as admin', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.setAdminRoleInTransaction.mockResolvedValue({
        success: true,
      });

      await service.updateMemberRole(
        1,
        2,
        { role: GroupMemberRole.MODERATOR },
        mockAdminMember,
      );

      expect(groupsRepository.setAdminRoleInTransaction).toHaveBeenCalledWith(
        1,
        2,
        GroupMemberRole.MODERATOR,
      );
    });

    it('should throw GroupNotFoundException for non-existent group', async () => {
      groupsRepository.findGroupById.mockResolvedValue(null);

      await expect(
        service.updateMemberRole(
          1,
          2,
          { role: GroupMemberRole.MODERATOR },
          mockAdminMember,
        ),
      ).rejects.toThrow(GroupNotFoundException);
    });

    it('should throw OnlyOneAdminException when promoting to admin with existing admin', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.setAdminRoleInTransaction.mockResolvedValue({
        success: false,
      });

      await expect(
        service.updateMemberRole(
          1,
          2,
          { role: GroupMemberRole.ADMIN },
          mockAdminMember,
        ),
      ).rejects.toThrow(OnlyOneAdminException);
    });
  });

  describe('transferOwnership', () => {
    it('should transfer ownership as admin', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.findMember.mockResolvedValue(mockRegularMember);
      groupsRepository.transferOwnership.mockResolvedValue(undefined);

      await service.transferOwnership(1, 3, mockAdminMember);

      expect(groupsRepository.transferOwnership).toHaveBeenCalledWith(1, 1, 3);
    });

    it('should throw GroupNotFoundException for non-existent group', async () => {
      groupsRepository.findGroupById.mockResolvedValue(null);

      await expect(
        service.transferOwnership(1, 3, mockAdminMember),
      ).rejects.toThrow(GroupNotFoundException);
    });

    it('should throw CannotTransferToSelfException when transferring to self', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);

      await expect(
        service.transferOwnership(1, mockAdminMember.userId, mockAdminMember),
      ).rejects.toThrow(CannotTransferToSelfException);
    });

    it('should throw TargetNotGroupMemberException when target is not a member', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.findMember.mockResolvedValue(null);

      await expect(
        service.transferOwnership(1, 3, mockAdminMember),
      ).rejects.toThrow(TargetNotGroupMemberException);
    });
  });

  describe('getMembers', () => {
    it('should return members', async () => {
      const mockMembers = [mockGroupMember];
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
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
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
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
      groupsRepository.countAdmins.mockResolvedValue(2);
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

  describe('generateInviteToken', () => {
    it('should generate token and save it to group', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
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

    it('should throw GroupNotFoundException for non-existent group', async () => {
      groupsRepository.findGroupById.mockResolvedValue(null);

      await expect(
        service.generateInviteToken(999, mockModeratorMember),
      ).rejects.toThrow(GroupNotFoundException);
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
      groupsRepository.findGroupByInviteToken.mockResolvedValue(groupWithToken);
      groupsRepository.addMemberIfNotExists.mockResolvedValue(mockGroupMember);

      const result = await service.acceptInvite('valid-token', 3);

      expect(result).toEqual({ groupId: groupWithToken.id });
      expect(groupsRepository.addMemberIfNotExists).toHaveBeenCalledWith({
        groupId: groupWithToken.id,
        userId: 3,
        role: GroupMemberRole.MEMBER,
      });
    });

    it('should throw UserAlreadyMemberException when already a member', async () => {
      const groupWithToken = { ...mockGroup, inviteToken: 'valid-token' };
      groupsRepository.findGroupByInviteToken.mockResolvedValue(groupWithToken);
      groupsRepository.addMemberIfNotExists.mockResolvedValue(null);

      await expect(service.acceptInvite('valid-token', 2)).rejects.toThrow(
        UserAlreadyMemberException,
      );
    });

    it('should propagate unexpected errors from repository', async () => {
      const groupWithToken = { ...mockGroup, inviteToken: 'valid-token' };
      groupsRepository.findGroupByInviteToken.mockResolvedValue(groupWithToken);
      groupsRepository.addMemberIfNotExists.mockRejectedValue(
        new Error('connection lost'),
      );

      await expect(service.acceptInvite('valid-token', 2)).rejects.toThrow(
        'connection lost',
      );
    });
  });
});
