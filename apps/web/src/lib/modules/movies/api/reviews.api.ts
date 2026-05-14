import {
	groupMovieReviewsControllerCreateV1,
	groupMovieReviewsControllerUpdateV1,
	groupMovieReviewsControllerDeleteV1
} from '$lib/api/generated/api';
import type { CreateReviewDto, ReviewResponseDto, UpdateReviewDto } from '$lib/api/generated/types';

export const createReview = async (
	groupId: number,
	movieId: number,
	data: CreateReviewDto,
	signal?: AbortSignal
): Promise<ReviewResponseDto> => {
	return groupMovieReviewsControllerCreateV1(groupId, movieId, data, { signal });
};

export const updateReview = async (
	groupId: number,
	movieId: number,
	reviewId: number,
	data: UpdateReviewDto,
	signal?: AbortSignal
): Promise<ReviewResponseDto> => {
	return groupMovieReviewsControllerUpdateV1(groupId, movieId, reviewId, data, { signal });
};

export const deleteReview = async (
	groupId: number,
	movieId: number,
	reviewId: number,
	signal?: AbortSignal
): Promise<void> => {
	return groupMovieReviewsControllerDeleteV1(groupId, movieId, reviewId, { signal });
};
