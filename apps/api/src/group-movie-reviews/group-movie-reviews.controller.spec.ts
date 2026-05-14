import { Test, TestingModule } from '@nestjs/testing';
import { CanActivate } from '@nestjs/common';

import { GroupMemberGuard } from '$src/groups/guards';
import { GroupMovieReview } from '$db/schemas';

import { GroupMovieReviewsController } from './group-movie-reviews.controller';
import { GroupMovieReviewsService } from './group-movie-reviews.service';
import { ReviewAuthorGuard } from './guards';
import { ReviewResponseDto } from './dto';

class MockGuard implements CanActivate {
  canActivate() {
    return true;
  }
}

describe('GroupMovieReviewsController', () => {
  let controller: GroupMovieReviewsController;
  let service: jest.Mocked<GroupMovieReviewsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupMovieReviewsController],
      providers: [
        {
          provide: GroupMovieReviewsService,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(GroupMemberGuard)
      .useValue(new MockGuard())
      .overrideGuard(ReviewAuthorGuard)
      .useValue(new MockGuard())
      .compile();

    controller = module.get<GroupMovieReviewsController>(
      GroupMovieReviewsController,
    );
    service = module.get(GroupMovieReviewsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call service.create with correct arguments', async () => {
      const dto = { rating: 4.5, text: 'Great' };
      service.create.mockResolvedValue({ id: 1 } as ReviewResponseDto);

      const result = await controller.create(1, 1, dto, 1);

      expect(service.create).toHaveBeenCalledWith(1, 1, 1, dto);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('update', () => {
    it('should call service.update with correct arguments', async () => {
      const dto = { rating: 5.0 };
      service.update.mockResolvedValue({ id: 1 } as ReviewResponseDto);

      const result = await controller.update(1, 1, 1, dto, 1, {
        id: 1,
      } as GroupMovieReview);

      expect(service.update).toHaveBeenCalledWith(1, 1, 1, 1, dto, { id: 1 });
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('delete', () => {
    it('should call service.delete with correct arguments', async () => {
      service.delete.mockResolvedValue(undefined);

      await controller.delete(1, 1, 1, 1, { id: 1 } as GroupMovieReview);

      expect(service.delete).toHaveBeenCalledWith(1, 1, 1, 1, { id: 1 });
    });
  });
});
