import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import {
  NotReviewAuthorException,
  ReviewNotFoundException,
} from '$common/exceptions';
import { GroupMovieReview } from '$db/schemas';
import { UserRole } from '$common/enums';

import { GroupMovieReviewsRepository } from '../group-movie-reviews.repository';
import { ReviewAuthorGuard } from './review-author.guard';

const createMockExecutionContext = (
  overrides: Record<string, unknown> = {},
): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({
        user: overrides.user ?? { id: 1, role: UserRole.USER },
        params: overrides.params ?? {
          groupId: '1',
          groupMovieId: '1',
          id: '1',
        },
      }),
    }),
  }) as ExecutionContext;

describe('ReviewAuthorGuard', () => {
  let guard: ReviewAuthorGuard;
  let repository: jest.Mocked<GroupMovieReviewsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewAuthorGuard,
        {
          provide: GroupMovieReviewsRepository,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<ReviewAuthorGuard>(ReviewAuthorGuard);
    repository = module.get(GroupMovieReviewsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow access for review author', async () => {
    repository.findOne.mockResolvedValue({
      id: 1,
      groupMovieId: 1,
      userId: 1,
    } as GroupMovieReview);

    const result = await guard.canActivate(createMockExecutionContext());

    expect(result).toBe(true);
  });

  it('should allow access for admin', async () => {
    repository.findOne.mockResolvedValue({
      id: 1,
      groupMovieId: 1,
      userId: 2,
    } as GroupMovieReview);

    const result = await guard.canActivate(
      createMockExecutionContext({
        user: { id: 1, role: UserRole.ADMIN },
      }),
    );

    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException if no userId', async () => {
    await expect(
      guard.canActivate(
        createMockExecutionContext({ user: { role: UserRole.USER } }),
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw ReviewNotFoundException if review not found', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(
      guard.canActivate(createMockExecutionContext()),
    ).rejects.toThrow(ReviewNotFoundException);
  });

  it('should throw ReviewNotFoundException if review groupMovieId mismatch', async () => {
    repository.findOne.mockResolvedValue({
      id: 1,
      groupMovieId: 999,
      userId: 1,
    } as GroupMovieReview);

    await expect(
      guard.canActivate(createMockExecutionContext()),
    ).rejects.toThrow(ReviewNotFoundException);
  });

  it('should throw NotReviewAuthorException if not author and not admin', async () => {
    repository.findOne.mockResolvedValue({
      id: 1,
      groupMovieId: 1,
      userId: 2,
    } as GroupMovieReview);

    await expect(
      guard.canActivate(createMockExecutionContext()),
    ).rejects.toThrow(NotReviewAuthorException);
  });
});
