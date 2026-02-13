import { Test, TestingModule } from '@nestjs/testing';

import {
  CannotRemoveGroupAdminException,
  CannotTransferToSelfException,
  GroupNotFoundException,
  NotGroupAdminException,
  NotGroupMemberException,
  NotGroupModeratorException,
  OnlyAdminCanTransferException,
  OnlyOneAdminException,
  TargetNotGroupMemberException,
  UserAlreadyMemberException,
} from '$common/exceptions';
import { GroupMemberRole } from '$common/enums';

import { GroupsRepository } from './groups.repository';
import { GroupCreateDto, GroupUpdateDto } from './dto';
import { GroupsService } from './groups.service';

const mockGroup = {
  id: 1,
  name: 'Test Group',
  description: 'Test Description',
  avatarUrl: 'https://example.com/avatar.jpg',
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

const createMockGroupsRepository = () => ({
  createGroup: jest.fn(),
  findGroupById: jest.fn(),
  findAllGroups: jest.fn(),
  findGroupsByUserId: jest.fn(),
  updateGroup: jest.fn(),
  deleteGroup: jest.fn(),
  addMember: jest.fn(),
  findMember: jest.fn(),
  findMembersByGroupWithUsers: jest.fn(),
  findMemberWithUser: jest.fn(),
  updateMemberRole: jest.fn(),
  setAdminRoleInTransaction: jest.fn(),
  removeMember: jest.fn(),
  countAdmins: jest.fn(),
  transferOwnership: jest.fn(),
  getGroupWithMember: jest.fn(),
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
      groupsRepository.addMember.mockResolvedValue(mockGroupMember);

      const result = await service.create(1, createDto);

      expect(result).toEqual(mockGroup);
      expect(groupsRepository.createGroup).toHaveBeenCalledWith({
        name: createDto.name,
        description: createDto.description,
        avatarUrl: createDto.avatarUrl,
      });
      expect(groupsRepository.addMember).toHaveBeenCalledWith({
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
      groupsRepository.findMember.mockResolvedValue(mockGroupMember);

      const result = await service.findOne(1, 2);

      expect(result).toEqual(mockGroup);
      expect(groupsRepository.findGroupById).toHaveBeenCalledWith(1);
    });

    it('should throw GroupNotFoundException for non-existent group', async () => {
      groupsRepository.findGroupById.mockResolvedValue(null);

      await expect(service.findOne(999, 1)).rejects.toThrow(
        GroupNotFoundException,
      );
    });

    it('should throw NotGroupMemberException for non-member', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.findMember.mockResolvedValue(null);

      await expect(service.findOne(1, 2)).rejects.toThrow(
        NotGroupMemberException,
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
      groupsRepository.getGroupWithMember.mockResolvedValue({
        group: mockGroup,
        member: { ...mockGroupMember, role: GroupMemberRole.MODERATOR },
      });
      groupsRepository.updateGroup.mockResolvedValue(mockGroup);

      const result = await service.update(1, 2, updateDto);

      expect(result).toEqual(mockGroup);
      expect(groupsRepository.updateGroup).toHaveBeenCalledWith(1, {
        name: 'Updated Name',
        description: 'Updated Description',
      });
    });

    it('should update group as admin', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.getGroupWithMember.mockResolvedValue({
        group: mockGroup,
        member: { ...mockGroupMember, role: GroupMemberRole.ADMIN },
      });
      groupsRepository.updateGroup.mockResolvedValue(mockGroup);

      await service.update(1, 2, updateDto);

      expect(groupsRepository.updateGroup).toHaveBeenCalled();
    });

    it('should throw GroupNotFoundException for non-existent group', async () => {
      groupsRepository.findGroupById.mockResolvedValue(null);

      await expect(service.update(999, 1, updateDto)).rejects.toThrow(
        GroupNotFoundException,
      );
    });

    it('should throw NotGroupModeratorException for regular member', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.getGroupWithMember.mockResolvedValue({
        group: mockGroup,
        member: { ...mockGroupMember, role: GroupMemberRole.MEMBER },
      });

      await expect(service.update(1, 2, updateDto)).rejects.toThrow(
        NotGroupModeratorException,
      );
    });

    it('should throw NotGroupModeratorException for non-member', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.getGroupWithMember.mockResolvedValue({
        group: mockGroup,
        member: null,
      });

      await expect(service.update(1, 2, updateDto)).rejects.toThrow(
        NotGroupModeratorException,
      );
    });
  });

  describe('remove', () => {
    it('should delete group as admin', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.findMember.mockResolvedValue({
        ...mockGroupMember,
        role: GroupMemberRole.ADMIN,
      });
      groupsRepository.deleteGroup.mockResolvedValue(undefined);

      await service.remove(1, 1);

      expect(groupsRepository.deleteGroup).toHaveBeenCalledWith(1);
    });

    it('should throw GroupNotFoundException for non-existent group', async () => {
      groupsRepository.findGroupById.mockResolvedValue(null);

      await expect(service.remove(999, 1)).rejects.toThrow(
        GroupNotFoundException,
      );
    });

    it.each([GroupMemberRole.MODERATOR, GroupMemberRole.MEMBER])(
      'should throw NotGroupAdminException for %s',
      async (role) => {
        groupsRepository.findGroupById.mockResolvedValue(mockGroup);
        groupsRepository.findMember.mockResolvedValue({
          ...mockGroupMember,
          role,
        });

        await expect(service.remove(1, 2)).rejects.toThrow(
          NotGroupAdminException,
        );
      },
    );
  });

  describe('addMember', () => {
    it('should add member as moderator', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.getGroupWithMember.mockResolvedValue({
        group: mockGroup,
        member: { ...mockGroupMember, role: GroupMemberRole.MODERATOR },
      });
      groupsRepository.findMember.mockResolvedValue(null);
      groupsRepository.addMember.mockResolvedValue(mockGroupMember);

      await service.addMember(1, { userId: 3 }, 2);

      expect(groupsRepository.addMember).toHaveBeenCalledWith({
        groupId: 1,
        userId: 3,
        role: GroupMemberRole.MEMBER,
      });
    });

    it('should add member with specified role', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.getGroupWithMember.mockResolvedValue({
        group: mockGroup,
        member: { ...mockGroupMember, role: GroupMemberRole.ADMIN },
      });
      groupsRepository.findMember.mockResolvedValue(null);
      groupsRepository.addMember.mockResolvedValue(mockGroupMember);

      await service.addMember(
        1,
        { userId: 3, role: GroupMemberRole.MODERATOR },
        2,
      );

      expect(groupsRepository.addMember).toHaveBeenCalledWith({
        groupId: 1,
        userId: 3,
        role: GroupMemberRole.MODERATOR,
      });
    });

    it('should throw GroupNotFoundException for non-existent group', async () => {
      groupsRepository.findGroupById.mockResolvedValue(null);

      await expect(service.addMember(999, { userId: 3 }, 1)).rejects.toThrow(
        GroupNotFoundException,
      );
    });

    it('should throw NotGroupModeratorException for regular member', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.getGroupWithMember.mockResolvedValue({
        group: mockGroup,
        member: { ...mockGroupMember, role: GroupMemberRole.MEMBER },
      });

      await expect(service.addMember(1, { userId: 3 }, 2)).rejects.toThrow(
        NotGroupModeratorException,
      );
    });

    it('should throw UserAlreadyMemberException for existing member', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.getGroupWithMember.mockResolvedValue({
        group: mockGroup,
        member: { ...mockGroupMember, role: GroupMemberRole.ADMIN },
      });
      groupsRepository.findMember.mockResolvedValue(mockGroupMember);

      await expect(service.addMember(1, { userId: 2 }, 1)).rejects.toThrow(
        UserAlreadyMemberException,
      );
    });
  });

  describe('removeMember', () => {
    it('should remove regular member as admin', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.findMember
        .mockResolvedValueOnce({
          ...mockGroupMember,
          userId: 3,
          role: GroupMemberRole.MEMBER,
        })
        .mockResolvedValueOnce({
          ...mockGroupMember,
          role: GroupMemberRole.ADMIN,
        });
      groupsRepository.removeMember.mockResolvedValue(undefined);

      await service.removeMember(1, 3, 1);

      expect(groupsRepository.removeMember).toHaveBeenCalledWith(1, 3);
    });

    it('should remove regular member as moderator', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.findMember
        .mockResolvedValueOnce({
          ...mockGroupMember,
          userId: 3,
          role: GroupMemberRole.MEMBER,
        })
        .mockResolvedValueOnce({
          ...mockGroupMember,
          role: GroupMemberRole.MODERATOR,
        });
      groupsRepository.removeMember.mockResolvedValue(undefined);

      await service.removeMember(1, 3, 2);

      expect(groupsRepository.removeMember).toHaveBeenCalledWith(1, 3);
    });

    it('should throw CannotRemoveGroupAdminException when trying to remove admin', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.findMember.mockResolvedValue({
        ...mockGroupMember,
        role: GroupMemberRole.ADMIN,
      });

      await expect(service.removeMember(1, 2, 3)).rejects.toThrow(
        CannotRemoveGroupAdminException,
      );
    });

    it('should throw NotGroupMemberException when requester is not a member', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.findMember
        .mockResolvedValueOnce({
          ...mockGroupMember,
          role: GroupMemberRole.MEMBER,
        })
        .mockResolvedValueOnce(null);

      await expect(service.removeMember(1, 3, 2)).rejects.toThrow(
        NotGroupMemberException,
      );
    });

    it('should throw NotGroupAdminException when moderator tries to remove moderator', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.findMember
        .mockResolvedValueOnce({
          ...mockGroupMember,
          userId: 3,
          role: GroupMemberRole.MODERATOR,
        })
        .mockResolvedValueOnce({
          ...mockGroupMember,
          role: GroupMemberRole.MODERATOR,
        });

      await expect(service.removeMember(1, 3, 2)).rejects.toThrow(
        NotGroupAdminException,
      );
    });
  });

  describe('updateMemberRole', () => {
    it('should update role to moderator as admin', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.findMember.mockResolvedValue({
        ...mockGroupMember,
        role: GroupMemberRole.ADMIN,
      });
      groupsRepository.setAdminRoleInTransaction.mockResolvedValue({
        success: true,
      });

      await service.updateMemberRole(
        1,
        2,
        { role: GroupMemberRole.MODERATOR },
        1,
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
        service.updateMemberRole(1, 2, { role: GroupMemberRole.MODERATOR }, 1),
      ).rejects.toThrow(GroupNotFoundException);
    });

    it('should throw NotGroupAdminException for non-admin', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.findMember.mockResolvedValue({
        ...mockGroupMember,
        role: GroupMemberRole.MODERATOR,
      });

      await expect(
        service.updateMemberRole(1, 2, { role: GroupMemberRole.MEMBER }, 3),
      ).rejects.toThrow(NotGroupAdminException);
    });

    it('should throw OnlyOneAdminException when promoting to admin with existing admin', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.findMember.mockResolvedValue({
        ...mockGroupMember,
        role: GroupMemberRole.ADMIN,
      });
      groupsRepository.setAdminRoleInTransaction.mockResolvedValue({
        success: false,
      });

      await expect(
        service.updateMemberRole(1, 2, { role: GroupMemberRole.ADMIN }, 1),
      ).rejects.toThrow(OnlyOneAdminException);
    });
  });

  describe('transferOwnership', () => {
    it('should transfer ownership as admin', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.findMember.mockResolvedValue({
        ...mockGroupMember,
        role: GroupMemberRole.ADMIN,
      });
      groupsRepository.transferOwnership.mockResolvedValue(undefined);

      await service.transferOwnership(1, 3, 1);

      expect(groupsRepository.transferOwnership).toHaveBeenCalledWith(1, 1, 3);
    });

    it('should throw GroupNotFoundException for non-existent group', async () => {
      groupsRepository.findGroupById.mockResolvedValue(null);

      await expect(service.transferOwnership(1, 3, 2)).rejects.toThrow(
        GroupNotFoundException,
      );
    });

    it('should throw OnlyAdminCanTransferException for non-admin', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.findMember.mockResolvedValue({
        ...mockGroupMember,
        role: GroupMemberRole.MODERATOR,
      });

      await expect(service.transferOwnership(1, 3, 2)).rejects.toThrow(
        OnlyAdminCanTransferException,
      );
    });

    it('should throw CannotTransferToSelfException when transferring to self', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.findMember.mockResolvedValue({
        ...mockGroupMember,
        role: GroupMemberRole.ADMIN,
      });

      await expect(service.transferOwnership(1, 1, 1)).rejects.toThrow(
        CannotTransferToSelfException,
      );
    });

    it('should throw TargetNotGroupMemberException when target is not a member', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.findMember
        .mockResolvedValueOnce({
          ...mockGroupMember,
          role: GroupMemberRole.ADMIN,
        })
        .mockResolvedValueOnce(null);

      await expect(service.transferOwnership(1, 3, 1)).rejects.toThrow(
        TargetNotGroupMemberException,
      );
    });
  });

  describe('getMembers', () => {
    it('should return members for group member', async () => {
      const mockMembers = [mockGroupMember];
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.findMember.mockResolvedValue(mockGroupMember);
      groupsRepository.findMembersByGroupWithUsers.mockResolvedValue(
        mockMembers,
      );

      const result = await service.getMembers(1, 2);

      expect(result).toEqual(mockMembers);
      expect(groupsRepository.findMembersByGroupWithUsers).toHaveBeenCalledWith(
        1,
      );
    });

    it('should throw GroupNotFoundException for non-existent group', async () => {
      groupsRepository.findGroupById.mockResolvedValue(null);

      await expect(service.getMembers(999, 1)).rejects.toThrow(
        GroupNotFoundException,
      );
    });

    it('should throw NotGroupMemberException for non-member', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.findMember.mockResolvedValue(null);

      await expect(service.getMembers(1, 2)).rejects.toThrow(
        NotGroupMemberException,
      );
    });
  });

  describe('getMemberMe', () => {
    it('should return member info for group member', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.findMemberWithUser.mockResolvedValue(mockGroupMember);

      const result = await service.getMemberMe(1, 2);

      expect(result).toEqual(mockGroupMember);
      expect(groupsRepository.findMemberWithUser).toHaveBeenCalledWith(1, 2);
    });

    it('should throw GroupNotFoundException for non-existent group', async () => {
      groupsRepository.findGroupById.mockResolvedValue(null);

      await expect(service.getMemberMe(999, 1)).rejects.toThrow(
        GroupNotFoundException,
      );
    });

    it('should throw NotGroupMemberException for non-member', async () => {
      groupsRepository.findGroupById.mockResolvedValue(mockGroup);
      groupsRepository.findMemberWithUser.mockResolvedValue(null);

      await expect(service.getMemberMe(1, 2)).rejects.toThrow(
        NotGroupMemberException,
      );
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
});
