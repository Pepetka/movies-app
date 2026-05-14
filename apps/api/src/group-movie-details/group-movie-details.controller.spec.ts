import { Test, TestingModule } from '@nestjs/testing';
import { CanActivate } from '@nestjs/common';

import { GroupMemberGuard, GroupModeratorGuard } from '$src/groups/guards';

import { GroupMovieDetailsController } from './group-movie-details.controller';
import { GroupMovieDetailsService } from './group-movie-details.service';

class MockGuard implements CanActivate {
  canActivate() {
    return true;
  }
}

describe('GroupMovieDetailsController', () => {
  let controller: GroupMovieDetailsController;
  let service: jest.Mocked<GroupMovieDetailsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupMovieDetailsController],
      providers: [
        {
          provide: GroupMovieDetailsService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            searchInGroup: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(GroupMemberGuard)
      .useValue(new MockGuard())
      .overrideGuard(GroupModeratorGuard)
      .useValue(new MockGuard())
      .compile();

    controller = module.get<GroupMovieDetailsController>(
      GroupMovieDetailsController,
    );
    service = module.get(GroupMovieDetailsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should call service.findAll with correct arguments', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll(1, {} as any);

      expect(service.findAll).toHaveBeenCalledWith(1, {});
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with correct arguments', async () => {
      service.findOne.mockResolvedValue({ id: 1 } as any);

      const result = await controller.findOne(
        1,
        1,
        { role: 'member' } as any,
        1,
      );

      expect(service.findOne).toHaveBeenCalledWith(1, 1, 'member', 1);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('searchInGroup', () => {
    it('should call service.searchInGroup with correct arguments', async () => {
      service.searchInGroup.mockResolvedValue({
        provider: { results: [] },
        currentGroup: [],
      } as any);

      const result = await controller.searchInGroup(1, {} as any);

      expect(service.searchInGroup).toHaveBeenCalledWith(1, {});
      expect(result).toEqual({ provider: { results: [] }, currentGroup: [] });
    });
  });
});
